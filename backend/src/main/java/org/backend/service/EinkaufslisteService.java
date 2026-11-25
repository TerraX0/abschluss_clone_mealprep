package org.backend.service;

import org.backend.dto.EinkaufslistenEintragDto;
import org.backend.entity.EinkaufslistenEintrag;
import org.backend.entity.Ernaehrungsplaneintrag;
import org.backend.entity.Rezept;
import org.backend.entity.RezeptZutat;
import org.backend.repository.EinkaufslistenEintragRepository;
import org.backend.repository.ErnaehrungsplaneintragRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EinkaufslisteService {

    // Zuordnungstabelle für Unicode-Bruchzeichen zu ihren Dezimalwerten
    private static final Map<Character, Double> UNICODE_BRUECHE = Map.of(
            '¼', 0.25,
            '½', 0.5,
            '¾', 0.75,
            '⅓', 1.0 / 3.0,
            '⅔', 2.0 / 3.0,
            '⅛', 0.125,
            '⅜', 0.375,
            '⅝', 0.625,
            '⅞', 0.875
    );

    // Erkennt führende Mengen mit Ganzzahl, Schrägstrich-Bruch, Unicode-Bruch oder Dezimalzahl und den Rest als Einheit.
    // Gruppen: (1) Ganzzahl, (2)/(3) Zähler/Nenner, (4) Unicode-Bruch, (5) Dezimalzahl, (6) Einheit.
    private static final Pattern MENGE_MIT_BRUCH_MUSTER = Pattern.compile(
            "^\\s*(?:(\\d+)\\s+)?(?:(\\d+(?:[.,]\\d+)?)\\s*/\\s*(\\d+(?:[.,]\\d+)?)|([¼½¾⅓⅔⅛⅜⅝⅞])|(\\d+(?:[.,]\\d+)?))\\s*(.*?)\\s*$"
    );

    private final ErnaehrungsplaneintragRepository ernaehrungsplaneintragRepository;
    private final EinkaufslistenEintragRepository einkaufslistenEintragRepository;

    public EinkaufslisteService(
            ErnaehrungsplaneintragRepository ernaehrungsplaneintragRepository,
            EinkaufslistenEintragRepository einkaufslistenEintragRepository
    ) {
        this.ernaehrungsplaneintragRepository = ernaehrungsplaneintragRepository;
        this.einkaufslistenEintragRepository = einkaufslistenEintragRepository;
    }

    @Transactional(readOnly = true)
    public List<EinkaufslistenEintragDto> holeEinkaufsliste() {
        return einkaufslistenEintragRepository.findAll()
                .stream()
                .map(this::wandleInDtoUm)
                .toList();
    }

    @Transactional
    public List<EinkaufslistenEintragDto> generiereAusWochenplan(LocalDate startDatum, LocalDate endDatum) {
        if ((startDatum == null) != (endDatum == null)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Bitte startDatum und endDatum gemeinsam angeben."
            );
        }
        if (startDatum != null && endDatum.isBefore(startDatum)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "endDatum darf nicht vor startDatum liegen."
            );
        }

        List<Ernaehrungsplaneintrag> eintraege = (startDatum != null)
                ? ernaehrungsplaneintragRepository.findByDatumBetween(startDatum, endDatum)
                : ernaehrungsplaneintragRepository.findAll();

        Map<String, AggregierteZutat> gruppiert = new LinkedHashMap<>();

        for (Ernaehrungsplaneintrag eintrag : eintraege) {
            Rezept rezept = eintrag.getRezept();
            if (rezept == null || rezept.getZutaten() == null) {
                continue;
            }

            int faktor = Math.max(1, eintrag.getPortionen());

            for (RezeptZutat zutat : rezept.getZutaten()) {
                if (zutat.getName() == null || zutat.getName().isBlank()) {
                    continue;
                }

                String bereinigt = zutat.getName().trim();
                String schluessel = bereinigt.toLowerCase(Locale.ROOT);
                String anzeigeName = kapitalisiereErstenBuchstaben(bereinigt);

                AggregierteZutat agg = gruppiert.computeIfAbsent(
                        schluessel,
                        k -> new AggregierteZutat(anzeigeName)
                );
                agg.fuegeMengeHinzu(zutat.getMenge(), faktor);
            }
        }

        einkaufslistenEintragRepository.deleteAllInBatch();

        List<EinkaufslistenEintrag> neueEintraege = gruppiert.values().stream()
                .map(agg -> new EinkaufslistenEintrag(
                        agg.anzeigeName,
                        agg.formatiereMenge(),
                        agg.anzahlVerwendungen,
                        false
                ))
                .toList();

        return einkaufslistenEintragRepository.saveAll(neueEintraege)
                .stream()
                .map(this::wandleInDtoUm)
                .toList();
    }

    private static String kapitalisiereErstenBuchstaben(String text) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        return text.substring(0, 1).toUpperCase(Locale.ROOT) + text.substring(1);
    }

    private EinkaufslistenEintragDto wandleInDtoUm(EinkaufslistenEintrag eintrag) {
        return new EinkaufslistenEintragDto(
                eintrag.getId(),
                eintrag.getName(),
                eintrag.getMenge(),
                eintrag.getAnzahlVerwendungen(),
                eintrag.isErledigt()
        );
    }

    private static final class AggregierteZutat {
        private final String anzeigeName;
        private int anzahlVerwendungen = 0;
        private final Map<String, Double> summenNachEinheit = new LinkedHashMap<>();
        private final Map<String, String> originalEinheit = new LinkedHashMap<>();
        private final List<String> sonstigeMengen = new ArrayList<>();

        private AggregierteZutat(String anzeigeName) {
            this.anzeigeName = anzeigeName;
        }

        private void fuegeMengeHinzu(String mengeRoh, int faktor) {
            int wirksamerFaktor = Math.max(1, faktor);
            this.anzahlVerwendungen += wirksamerFaktor;

            if (mengeRoh == null || mengeRoh.isBlank()) {
                return;
            }

            String getrimmt = mengeRoh.trim();
            Double parsedWert = parseMengeWert(getrimmt);
            Matcher matcher = MENGE_MIT_BRUCH_MUSTER.matcher(getrimmt);

            if (parsedWert != null && matcher.matches()) {
                double zahl = parsedWert * wirksamerFaktor;
                String einheit = matcher.group(6).trim();
                String einheitKey = einheit.toLowerCase(Locale.ROOT);

                summenNachEinheit.merge(einheitKey, zahl, Double::sum);
                originalEinheit.putIfAbsent(einheitKey, einheit);
            } else {
                for (int i = 0; i < wirksamerFaktor; i++) {
                    sonstigeMengen.add(getrimmt);
                }
            }
        }

        private static Double parseMengeWert(String eingabe) {
            Matcher matcher = MENGE_MIT_BRUCH_MUSTER.matcher(eingabe);
            if (!matcher.matches()) {
                return null;
            }

            double ganzzahl = 0.0;
            if (matcher.group(1) != null) {
                ganzzahl = Double.parseDouble(matcher.group(1));
            }

            if (matcher.group(2) != null && matcher.group(3) != null) {
                double zaehler = Double.parseDouble(matcher.group(2).replace(',', '.'));
                double nenner = Double.parseDouble(matcher.group(3).replace(',', '.'));
                if (nenner == 0.0) {
                    return null;
                }
                return ganzzahl + (zaehler / nenner);
            }

            if (matcher.group(4) != null) {
                Double bruchWert = UNICODE_BRUECHE.get(matcher.group(4).charAt(0));
                if (bruchWert == null) {
                    return null;
                }
                return ganzzahl + bruchWert;
            }

            if (matcher.group(5) != null) {
                return ganzzahl + Double.parseDouble(matcher.group(5).replace(',', '.'));
            }

            return null;
        }

        private String formatiereMenge() {
            List<String> teile = new ArrayList<>();

            for (Map.Entry<String, Double> entry : summenNachEinheit.entrySet()) {
                double wert = entry.getValue();
                String einheit = originalEinheit.getOrDefault(entry.getKey(), "");
                String zahlStr = formatiereZahl(wert);

                teile.add(einheit.isEmpty() ? zahlStr : zahlStr + " " + einheit);
            }

            teile.addAll(sonstigeMengen);
            return String.join(" + ", teile);
        }

        private static String formatiereZahl(double wert) {
            double gerundetAufZehntel = Math.round(wert * 10.0) / 10.0;
            if (Math.abs(gerundetAufZehntel - Math.round(gerundetAufZehntel)) < 0.0001) {
                return String.valueOf(Math.round(gerundetAufZehntel));
            }
            return String.format(Locale.GERMAN, "%.1f", gerundetAufZehntel);
        }
    }

    // ----------------------------NEU US7-------------------------------------//
    @Transactional
    public EinkaufslistenEintragDto schalteErledigtUm(Long id) {
        EinkaufslistenEintrag eintrag = einkaufslistenEintragRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Einkaufslisteneintrag nicht gefunden: " + id
                ));

        eintrag.setErledigt(!eintrag.isErledigt());
        EinkaufslistenEintrag gespeichert = einkaufslistenEintragRepository.save(eintrag);
        return wandleInDtoUm(gespeichert);
    }

    @Transactional
    public EinkaufslistenEintragDto fuegeFreienArtikelHinzu(String name, String menge) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Artikelname darf nicht leer sein."
            );
        }

        String bereinigterName = kapitalisiereErstenBuchstaben(name.trim());
        String bereinigteMenge = (menge != null && !menge.isBlank())
                ? menge.trim() : "";


        EinkaufslistenEintrag neuerEintrag = new EinkaufslistenEintrag(
                bereinigterName,
                bereinigteMenge,
                // 0 = nicht aus dem Wochenplan generiert, sondern manuell ergänzt
                0,
                false
        );

        EinkaufslistenEintrag gespeichert = einkaufslistenEintragRepository.save(neuerEintrag);
        return wandleInDtoUm(gespeichert);
    }

    @Transactional
    public void loescheErledigteEintraege() {
        einkaufslistenEintragRepository.deleteByErledigtTrue();
    }
}