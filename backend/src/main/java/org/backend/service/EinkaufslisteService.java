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
    // US 9: VorratService injizieren
    private final VorratService vorratService;

    public EinkaufslisteService(
            ErnaehrungsplaneintragRepository ernaehrungsplaneintragRepository,
            EinkaufslistenEintragRepository einkaufslistenEintragRepository,
            VorratService vorratService // US-09
    ) {
        this.ernaehrungsplaneintragRepository = ernaehrungsplaneintragRepository;
        this.einkaufslistenEintragRepository = einkaufslistenEintragRepository;
        this.vorratService = vorratService;
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

        // US-09: Vorratsmengen laden und mit den benötigten Mengen quasi "verrechnen".
        // Für eine getrennte Speicherung von Gesamtmenge, Vorrat und Restmenge bräuchte man
        // eigene Felder/DB-Spalten – hier wird die im Vorrat vorhandene Zutatmenge als einfacher Text in die EInkaufsliste geschrieben.
        Map<String, String> vorratMengen = vorratService.holeVorratMengenLowercase();

        List<EinkaufslistenEintrag> neueEintraege = gruppiert.entrySet().stream()
                .map(entry -> baueEinkaufslistenEintrag(
                        entry.getValue(),
                        vorratMengen.get(entry.getKey())
                ))
                .toList();

        return einkaufslistenEintragRepository.saveAll(neueEintraege)
                .stream()
                .map(this::wandleInDtoUm)
                .toList();
    }

    private EinkaufslistenEintrag baueEinkaufslistenEintrag(AggregierteZutat agg, String vorratMengeRoh) {
        String basisMenge = agg.formatiereMenge();

        // Zutat ist gar nicht im Vorrat vorhanden
        if (vorratMengeRoh == null) {
            return new EinkaufslistenEintrag(
                    agg.anzeigeName,
                    basisMenge,
                    agg.anzahlVerwendungen,
                    false
            );
        }

        String vorratInfo = vorratMengeRoh.isBlank() ? "im Vorrat" : vorratMengeRoh + " im Vorrat";

        // Fall 1: Eindeutige numerische Einheit vorhanden -> Restmenge berechnen
        if (agg.hatEindeutigeNumerischeEinheit()) {
            String einheitKey = agg.einzigeEinheitKey();
            String einheitLabel = agg.originalEinheit.getOrDefault(einheitKey, "");
            double benoetigt = agg.summenNachEinheit.get(einheitKey);

            Double vorratZahl = parseMengeWert(vorratMengeRoh);
            Matcher vorratMatcher = MENGE_MIT_BRUCH_MUSTER.matcher(vorratMengeRoh);
            String vorratEinheitKey = vorratMatcher.matches()
                    ? vorratMatcher.group(6).trim().toLowerCase(Locale.ROOT)
                    : "";

            if (vorratZahl != null && vorratEinheitKey.equals(einheitKey)) {
                double rest = benoetigt - vorratZahl;

                // Komplett durch den Vorrat abgedeckt -> als erledigt/vorhanden markieren
                if (rest <= 0.0001) {
                    String mengeText = basisMenge.isBlank()
                            ? "Bereits im Vorrat (" + vorratInfo + ")"
                            : "0 " + einheitLabel + " (benötigt: " + basisMenge + ", " + vorratInfo + ")";
                    return new EinkaufslistenEintrag(
                            agg.anzeigeName,
                            mengeText.trim(),
                            agg.anzahlVerwendungen,
                            true
                    );
                }

                // Teilmenge vorhanden -> Restmenge anzeigen
                String restStr = formatiereZahl(rest);
                String restMitEinheit = einheitLabel.isEmpty() ? restStr : restStr + " " + einheitLabel;
                String mengeText = restMitEinheit + " (" + vorratInfo + ")";
                return new EinkaufslistenEintrag(
                        agg.anzeigeName,
                        mengeText,
                        agg.anzahlVerwendungen,
                        false
                );
            }
        }

        // Fall 2: Vorrat vorhanden, aber Einheiten unterschiedlich oder ohne Zahl -> als Hinweis mitgeben
        String mengeText = basisMenge.isBlank()
                ? "Bereits im Vorrat (" + vorratInfo + ")"
                : basisMenge + " (" + vorratInfo + ")";

        return new EinkaufslistenEintrag(
                agg.anzeigeName,
                mengeText,
                agg.anzahlVerwendungen,
                false
        );
    }

    // ------------------------------------------------------------------------//
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

    private static String formatiereZahl(double wert) {
        double gerundetAufZehntel = Math.round(wert * 10.0) / 10.0;
        if (Math.abs(gerundetAufZehntel - Math.round(gerundetAufZehntel)) < 0.0001) {
            return String.valueOf(Math.round(gerundetAufZehntel));
        }
        return String.format(Locale.GERMAN, "%.1f", gerundetAufZehntel);
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

    private static final class AggregierteZutat {
        private final String anzeigeName;
        private int anzahlVerwendungen = 0;
        private final Map<String, Double> summenNachEinheit = new LinkedHashMap<>();
        private final Map<String, String> originalEinheit = new LinkedHashMap<>();
        private final List<String> sonstigeMengen = new ArrayList<>();

        // Im Wochenplan kann dieselbe Zutat an verschiedenen Tagen,
        // in verschiedenen Rezepten oder mit mehreren Portionen vorkommen.
        // Ein AggregierteZutat-Objekt sammelt pro Zutat (schluessel in Kleinbuchstaben) alle Vorkommen ein.
        private AggregierteZutat(String anzeigeName) {
            this.anzeigeName = anzeigeName;
        }

        // Prüft, ob die Zutat nur eine einzige numerische Einheit
        // (z. B. nur "g") und keine sonstigen Mengenangaben hat.
        private boolean hatEindeutigeNumerischeEinheit() {
            return sonstigeMengen.isEmpty() && summenNachEinheit.size() == 1;
        }

        // Liefert den kleingeschriebenen Einheitenschlüssel
        // (z. B. "g") dieser einzigen numerischen Einheit.
        private String einzigeEinheitKey() {
            return summenNachEinheit.keySet().iterator().next();
        }

        // Fügt eine rohe Mengenangabe (mit Portionsfaktor) zur aggregierten Zutat hinzu:
        // zählt die Verwendungen hoch und summiert numerische Mengen nach Einheit
        // oder merkt nicht-numerische Angaben unter sonstigeMengen vor.
        private void fuegeMengeHinzu(String mengeRoh, int faktor) {
            // Mindestens Faktor 1 ansetzen und die Gesamtzahl der Verwendungen erhöhen
            int wirksamerFaktor = Math.max(1, faktor);
            this.anzahlVerwendungen += wirksamerFaktor;

            if (mengeRoh == null || mengeRoh.isBlank()) {
                return;
            }

            String getrimmt = mengeRoh.trim();
            Double parsedWert = parseMengeWert(getrimmt);
            Matcher matcher = MENGE_MIT_BRUCH_MUSTER.matcher(getrimmt);

            if (parsedWert != null && matcher.matches()) {
                // Mit Portionen multiplizieren und nach kleingeschriebener Einheit aufsummieren
                double zahl = parsedWert * wirksamerFaktor;
                String einheit = matcher.group(6).trim();
                String einheitKey = einheit.toLowerCase(Locale.ROOT);

                summenNachEinheit.merge(einheitKey, zahl, Double::sum);
                // Erste Schreibweise der Einheit (z. B. "g" oder "EL") für die Anzeige merken
                originalEinheit.putIfAbsent(einheitKey, einheit);
            } else {
                // Fallback für unparsebare/textliche Mengen (z. B. "nach Geschmack" oder "1 Prise")
                for (int i = 0; i < wirksamerFaktor; i++) {
                    sonstigeMengen.add(getrimmt);
                }
            }
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