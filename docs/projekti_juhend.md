Projekti juhend
Lõpetamise nõuded
Projekti sisu
Projekti all mõtleme selles aines mingit suuremamahulist programmeerimisülesannet, mille teema valid ise (koos paarilisega). Eriti tore oleks, kui projekti käigus valminud programm oleks kasulik su erialaste probleemide lahendamisel. Aga võid valida ka teema, mis on seotud isiklike huvide või hobidega jne. Näiteks võib projektiks olla mõne rutiinse töö automatiseerimine, mõne andmestiku töötlemine või visualiseerimine, mõne inimliku tegevuse modelleerimine vms. See aga ei tohi olla mõni üldtuntud, veebist leitav programm. Sinu töö peab lisama juurde midagi uut (funktsionaalsus, kontekst, andmestik vms).

Vahendid
Projektis on soovitatav kasutada vahendeid, mida meie kursuse põhiosas ei õpetata. Toome välja paar huvitavamat teeki, mida võib kasutada (aga ei pea):

Andmetöötlus ja masinõpe: pandas, numpy, matplotlib, seaborn, networkx, scikit-learn
Kasutajaliidesed: tkinter, PySimpleGUI
Pildi- ja helitöötlus: Pillow, OpenCV, sounddevice
Mängud: pygame
Veeb: requests, beautifulsoup4, flask, fastapi
Keeletöötlus ja tehisintellekt: nltk, spaCy, transformers, SpeechRecognition
Kui kahtled valitud teema sobivuses, siis pea kindlasti nõu praktikumijuhendajaga!

Tähtajad
Projekt tuleb teha kahekesi ja on jagatud kolme ossa.

Leia oma praktikumirühmast endale paariline ja vali teema. Registreeru Moodle'is koos paarilisega endale sobivasse rühma ning esita projekti idee ja eesmärgi lühikirjeldus. Tähtaeg neljapäev, 23. oktoober.
Alfaversioon (4 punkti). Selle etapi lõpuks esita oma programmi esialgne versioon ning ühtlasi kirjelda, millised on edasised plaanid ja edasiarendused. Tähtaeg kolmapäev, 12. november.
Beetaversioon (6 punkti). Selle etapi lõpuks on eelnevalt paika pandud edasiarendused lõpule viidud ning projekti võib avaldada. Tähtaeg kolmapäev, 17. detsember.
Viimases praktikumis toimuvad projektiesitlused, kus saad oma projekti kaasüliõpilastele tutvustada ja teistele projektidele tagasisidet anda.

Töömaht
Projekti mahtu võib hinnata järgmiselt. Kogu kursuse töömaht on 6*26 = 156 tundi. Projekt annab kokku 10 punkti 100-st, seega on selle töömaht ligikaudu 10/100*156 = 15,6 tundi inimese kohta. Et projekt tehakse paaristööna, siis on projekti nominaalne kogumaht ligikaudu 2*15,6 = 31,2 tundi.

Töökorraldus
Projekti paarilise leidmiseks või oma projektiidee reklaamimiseks võid saata sõnumi oma kanalisse Zulipis või võtta võimaliku kaaslasega otse ühendust Zulipi või Moodle'i sõnumite abil (lehe ülaosas asuv vestlusmulli ikoon).

Kui oled projektirühma valinud, muutub kursuse pealehe ülaosas kättesaadavaks komplekt projekti tööriistu. Neid tööriistu võite kasutada oma rühmas suhtlemiseks, aga võite ka kasutada omaenda suhtlusvahendeid. Moodle'is pakutavad vahendid on kättesaadavad ainult teie rühmale (ja praktikumijuhendajale), aga mitte teistele rühmadele. Projekti koosolekuruumis on kõigil teie projektirühma liikmetel moderaatori õigused.

Projekti ühistöö organiseerimiseks võib soovi korral kasutada ka Git-keskkonda, nagu GitHub, GitLab vms. On olemas ka ülikooli kontoga seotud GitLab. Mõned juhendid: GitHubi kiirstart, gümnaasiumiõpiku versioonhalduse peatükk, Bitbucket Cloudi ülevaade. Projekti tegevuste ja märkmete haldamise kohta: Trello õpetus. Siin on ka väike ülevaade moodulitest.

Siin on mõned suunised töö korraldamiseks oma projektirühmas.

Pange paika suhtluskanalid. Otsustage, mis vahendeid te kasutama hakkate, ning olge seal kogu projekti tegemise aja jooksul teineteisele kättesaadavad.
Leppige kokku, mis peaks olema valmis alfaversiooni tähtajaks ja mis beetaversiooni tähtajaks. Hinnake töömahtu realistlikult.
Jagage ülesanded. Jälgige, et need vastaksid kummagi liikme tugevustele ja huvidele ning töökoormus oleks õiglaselt jaotatud.
Plaanige regulaarsed ülevaatused, näiteks kord või kaks korda nädalas, et arutada projekti edenemist ja lahendada probleeme. See aitab teil püsida graafikus ja teha vajadusel muudatusi.
Vormistusnõuded
Programmifaili alguses peaks olema päis, kus on kirjas projekti teema, autorid, eeskujuna kasutatud allikad ning muu oluline info. Programmiteksti kommenteerimisel tuleb appi standard PEP 257, mis soovitab funktsioonide juures kasutada docstring'e. Ei ole oluline iga rida kommenteerida, vaid kommentaare peab olema nii palju, et programm oleks selgesti loetav ja mõistetav.

Programmi kasutatavad muutujanimed peaksid aitama programmist aru saada. Muutujanimedes kasutada väikesi tähti ja sõnade eraldamiseks alakriipsu (näiteks ringi_pindala). Lubatud on ka ingliskeelsed muutujanimed. Standard PEP 8 kirjeldab, millised võiksid olla muutujanimed, kuhu asetada tühikud jne.

Programmi komponentide järjestus: impordid, funktsioonid, põhiprogramm. Soovitatav on vormistada põhiprogrammi sisu funktsioonina main.

Hinde saamiseks peab projekt olema originaalne Pythoni programm. Maht peaks vastama projekti minimaalsele hinnangulisele töömahule. Programmi üldstruktuur ja tekst peavad olema lugejale arusaadavad.