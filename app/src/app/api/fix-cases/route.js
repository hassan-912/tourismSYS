import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Case from '@/lib/models/Case';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

const dataStr = `7954	 Youssef Maher Elsayed Mohamed Eliwa 	Nasser	Hussein		01/03/2026 	Spain alex				
20500	Adham Mohammad Abdelwahab Farah	Nasser	Moustafa		02/03/2026 	Spain alex				
19508	Mohamed Rabie Zaky Ahmed Ashry	Salma Youssry	Moustafa		02/03/2026 	Germany B	MohamedAshry@mgmailz.com	AppointmentsMG123@		
14365	Ebrahim Mahmoud Ebrahim Daigham	Salma Ibrahim 	Moustafa		3 / 3 / 2026	"France Hurghadaa"	ebrahem.daigham@mgmailz.com	AppointmentsMG123@		
10805	Fares Abdelhamid Ahmed Abdellatif Shalaby	Salma Ibrahim 	Moustafa		3 / 3 / 2026	Germany B				
15543	Erian Youssef Barreh Youssef And His Wife	Salma Youssry	Moustafa		4 / 3 / 2026	"France Hurghadaa"	erian.youssef@mgmailz.com	                                        		
2860	Mohamed Mohamed Ali Mohamed Ali ElMallah	Salma Ayman	Hamza		4 / 3 / 2026	Spain Tour.	mohamedelmallah736@gmail.com991@mallah			
16853	Mahmoud Nasr Mohamed Aboukhattab	Nasser	Hussein		4 / 3 / 2026	Spain Tour.				
19788	Moahmed Kamal Ahmed Baioumy 	Salma Ibrahim 	Moustafa		5 / 3 / 2026	Germany B	mohamed.baioumy@mgmailz.com	AppointmentsMG123@		
18668	Mohamed Abouelyazid Ahmed  Gad	Salma Youssry	Hussein		5 / 3 / 2026	Germany B	mohamedgad@mgmailz.com	AppointmentsMG123@		
19605	Mohamed Saad Fouad Abdelaziz	Salma Youssry	Moustafa		05/03/2026 	"France Hurghadaa"	mohamed.abdelaziz@mgmailz.com	AppointmentsMG123@		
18984	Ahmed Mhamoud Mohamed Salama Elsisi	NOHA	Moustafa		05/03/2026 	Germany T	ahmed.salama91@mgmailz.com	AhmedSalama@12345		
8279	Mohamed Ibrahim Abdulaa Ahmed	NOHA	Moustafa		05/03/2026 	"France Hurghadaa"	mo.ahmed@mgmailz.com	MoAhmed@12345		
18526	Elsayad Khaled Ali Elkerdaw	MG+	Moustafa		05/03/2026 	France  T	elsayedkhaled@mgmailz.com	Ahmedossary123@		
10950	Moemen Abdellatif Mohamed Abdellatif	Salma Ibrahim 	Moustafa		05/03/2026 	Germany T	moemen.abdellatif@mgmailz.com	Moemen@12345		
15863	Ahmed Gomaa Elsayed Mohamed Abouzeid Elzeki	Hassan	Moustafa		05/03/2026 	"France Hurghadaa"	ahmedelziky29@gmail.com	Ahmedossary123@		
20068	Mohamed Nasr Bassuoni Khalafallah	Moعtaz	Moعtaz		03/06/2026 	"France From Keniya"				
20170	Ahmed Magdy Mohamed	Moعtaz	Hussein		8 / 3 / 2026	Spain alex				
21179	Mohamed Mohamed Ibrahim Salam	Salma Ibrahim 	Moustafa		8 / 3 / 2026	Spain alex				
16846	Hasan Ismail Hasan Ali Aboukol	YARA 	Hussein		09/03/2026 	Spain alex				
19802	Abdelwahab Ahmed Mohmaed Alrazky                                                                                                              ميعاد عائلي 4 افراد Door To Door	NOHA	Hussein		9 / 3 / 2026	France 	abdelwahab.razky@mgmailz.com	AppointmentsMG123@		
11797	Shenoda Shafik Kamel Fawzi        	YARA 	Hussein		10 / 3 / 2026	Spain Tour.				
19520	Hassan Hamada Ahmed Ibrahim Yacoub	Salma Ibrahim 	Moustafa		10 / 3 / 2026	"France Hurghadaa"	hassan.yacoub@mgmailz.com	HassanY@12345		
12507	Gamal Mohamed Othman Elsayed	Salma Youssry	Hussein		11 / 3 / 2026	"France Hurghadaa"	gamalelsayed11@mgmailz.com	Ahmedossary123@		
22084	Mahmoud Mohamed Mohamed Hassan Agha	Salma Ibrahim 	Moustafa		11 / 3 / 2026	Germany B				
16468	Mohamed Hashem Amin Mohamed Abouarab	Salma Youssry	Moustafa		12 / 3 / 2026	Germany B	mohamedabouarab6@gmail.com	Mohamed@12345		
19012	Mahmoud Badawy Sedik Seyam	Salma Youssry	Moustafa		12 / 3 / 2026	Poland B				
20853	Maro Younan Mekhail Said	Salma Ibrahim 	Moustafa		12 / 3 / 2026	Poland B				
18944	Hamed Ahmed Zakaria Elawamy	MG+	Hussein		12 / 3 / 2026	"France Hurghadaa"	hamed.awamy@mgmailz.com	AppointmentsMG123@		
20269	Mohamed Hany Abdelgawad Oun	MG+	Hussein		12 / 3 / 2026	"France Hurghadaa"	mohamedhany@mgmailz.com	AppointmentsMG123@		
20019	Reda Mohamed Hassan Mazia	Salma Youssry	Moustafa		15 / 3 / 2026	Germany B	reda.mazia@mgmailz.com	AppointmentsMG123@		
20743	Ahmed Hassan Mohamed Ahmed	Nasser	Moustafa		15 / 3 / 2026	Netherlands T				
14134	Hany Magdy Tawfik Gerges 	Salma Ayman			17-03-2027	Spain alex	magedgerges981@gmail.com	MAIL:  Egypt@58903 BLS:   Sid#12347		
20840	Beshoy Bakey Fawzy Abd Elbaky Mosa  	Nasser	Nasser	مش داخل	18/03/2026	Germany B UAE			nzl masr herb men el uae	
19222	Merhan Mohamed Abdelrehem Hussien Elzagh	Nasser	Nasser	مش داخل	18/03/2026	Spain Tour.			ekamtha ha tenthy	
18884	Shinoda Edward Shukri Tawfig	Nasser	Nasser	مش داخل	18/03/2026	Germany Bus.			m7goz fel sodan msh 3aref yrg3	
11221	Youssef Shawki Hennes Salama	Salma Youssry	Moustafa		18/03/2026	Netherlands T				
15576	Saad Mohamed Mohamed Gaafar And His Son	Salma Ibrahim 	Moustafa		18/03/2026	Spain 	SAADGAAFAR273@gmail.com	MAIL;  Egypt@123 BLS:    Sid#12347		
21149	Ahmed Ashraf Mohamed Abdelfattah Hassan	Hassan	Moustafa		18/03/2026	Spain alex				
7050	Nader Adel Yacoub Abdelmalak And His Father	Nasser	Moustafa		19 / 3 / 2026	Spain alex				
15677	Mohamed Hamdi Mohamed Mahmoud Galal	Salma Ibrahim	Moustafa		26 / 3 / 2026	Germany B	mohamedhgalal79@gmail.com	Mohamed@12345		
4558	Abdelrazek Moustafa Abdelatti Amer	Nasser	Moustafa		29/03/2026	Netherlands T				
21341	Mahmoud Farid Mohamed Elbayoumi Selim 	Nasser	Nasser		29/03/2026	Germany T KSA				
20460	Mina Reda Habib Mansour	Salma Youssry	Moustafa		29 / 03 / 2026	Netherlands T				
16211	Omar Mokhtar Elshahat Mohamed	Salma Ibrahim 			29 / 03 / 2026	Spain alex	omarelsoudypfnx@dollicons.com	Amine@044		
14415	Mohamed Adel Mohamed Abdelnaby Gamil	Nasser	Nasser	مسترسيد يرد عليا 	31/03/2026	Spain Tour.				
		Dina Abdelnaby Mohamed Abdelnaby	Nasser	Nasser							
11462	Hamada Hamdy Khalil Aboudghid	Nasser	Moustafa		01/04/2026 	Spain alex				
11893	Mahmoud Mohamed Abdelkader Mohram	Moعtaz	Moustafa		01/04/2026 	Spain alex				
12865	Mahmoud Elsherbini Mahmoud Mohamed Hussein	Hassan	Hussein		01/04/2026 	Spain Tour.	MAHMOUDHUSSEIN5846@gmail.com	Sid#12347		
20275	Mona Kamal Abdelmoneim Moslehi And Her Son	Salma Youssry	Moustafa		01/04/2026 	"France Hurghadaa"	MonaMoslehi@mgmailz.com	AppointmentsMG123@	معاد عائلي 	
16381	Tarek Abdelshafy Mohamed Halawa	Salma Ibrahim 	Moustafa		01/04/2026 	Germany B	tarek.halawa@mgmailz.com	AppointmentsMG123@		
18551	Ibrahim Ahmed Mohamed Ahmed	MG+	Moustafa		01/04/2026 	Germany B	ibrahim.ahmed@mgmailz.com	AppointmentsMG123@		
20623	Essam Ahmed Hamed Hassan Hamed	Salma Ayman	Moustafa		02/04/2026 	Germany B	EssamHamed@mgmailz.com	AppointmentsMG123@		
13784	Karim Elsayed  Ahmed  Elgamal	Salma Ibrahim 	Moustafa		06/04/2026 	Spain alex				
20130	Kerolos Samir Ishak Metri	Passant 	Moustafa		06/04/2026 	Spain alex				
13678	Hassan Mohamed Gomaa Mostafa        	Menna	Hussein		06/04/2026 	Spain alex				
12507	Gamal Mohamed Othman Elsayed	Nasser			06/04/2026 	France T alex	gamalelsayed11@mgmailz.com	AppointmentsMG123@		
12574	Ahmed Mohamed Saber Ahmed Abdalatif	Nasser	Moustafa		07/04/2026 	Spain alex				
14359	Omar Gamal Mostafa Abdelsayed Abouhandy And His Mother	Salma Youssry	Moustafa		07/04/2026 	Croatia  T				
12559	Rami AdIb Jouda Bekhit	Salma Youssry	Moustafa		08/04/2026 	Spain alex	RAMYBEKHIT21@gmail.com	Sid#12347		
21321	Ahmed Fathy Taha Mohamed	Nasser			08/04/2026 	France  T  DOOR TO DOOR	ahmed.taha@mgmailz.com	AppointmentsMG123@		
5766	Mohamed Essam Abdelsamea Aboelala Ali And His Wife	Salma Ibrahim 			08/04/2026 	Netherlands T				
20630	mohamed mahmoud ali	Salma Ibrahim 			15/04/2027	Germany B	mohamed.elsoni@mgmailz.com	AppointmentsMG123@		
19520	Hassan Hamada Ahmed Ibrahim Yacoub	Salma Ibrahim 	Moustafa		15/04/2027	France  T  DOOR TO DOOR				
13129	Ghada Elgioushe Zaki Elsharkawy	MG+			15/04/2027	Germany B	ghadaelsharkawy118@gmail.com	AppointmentsMG123@		
7412	Eslam Mohamed Omar Ahmed Yossef	Hassan			20/04/2026	France  T	eslam.yossef@mgmailz.com	EslamY@12345		
21078	Basel Emad Elsayed Elghandour	Nasser			20/04/2026	Spain Tour.				
20997	Mona Naguib Abdel Wahab	Salma Ibrahim 			21/04/2026	France  T  DOOR TO DOOR	MonaWahab@mgmailz.com	AppointmentsMG123@		
22039	Anwar Fathi Mohamed Ali	Salma Youssry			23/04/2027	France  T  DOOR TO DOOR	anwar.ali@mgmailz.com	AppointmentsMG123@		
17586	Abdelaziz Ahmed Fathalla Badr	MG+			27/04/2026	"France Hurghadaa"	abdelazizbadr@mgmailz.com	AppointmentsMG123@		
18813	Ahmed Elmoatasem Abdelhamied Ahmed Amin	Salma Ibrahim 			28/04/2026	"France Hurghadaa"	ahmed.amin02@mgmailz.com	AppointmentsMG123@		
18813	Zeina Abdallah Ahmed Abdallah Ghamry \u0632\u0648\u062c\u0647 \u0627\u062d\u0645\u062f \u0627\u0644\u0645\u0639\u062a\u0635\u0645	Salma Ibrahim 			28/04/2026	"France Hurghadaa"	ahmed.amin02@mgmailz.com	AppointmentsMG123@		
16814	Ahmed Gad Osman Elsayed Fatoush	MG+			28/04/2026	"France Hurghadaa"	AhmedFatoush@mgmailz.com	AppointmentsMG123@		
17903	Reem AlaaEldin Elsayed Aly Ahmed	MG+			28/04/2026	"France Hurghadaa"	reem.ahmed9618@gmail.com	Reem@12345		
6532	Sayed Mahmoud Emam Mahmoud	Salma Ayman			28/04/2026	"France Hurghadaa"	sayed.mahmoud@mgmailz.com	AppointmentsMG123@		
9989	Essam Mohamed Robi Mahmoud	Hassan			30/04/2026	Germany B Alex	mostafasoheim6@gmail.com	Aa@123456		
19020	Mohamed Hamad Ahmed Hamed	Menna			04 / 5 / 2026	Germany B	mohamed.hamed@mgmailz.com	AppointmentsMG123@		
21907	Mohamed Mohamed Kilany	Moعtaz			5 / 5 / 2026	Germany B	mohamed.abdelkader@mgmailz.com	AppointmentsMG123@		
21303	Said Mohamed Attia Mohamed	Nasser			5 / 5 / 2026	Germany B	said.mohamed@mgmailz.com	AppointmentsMG123@		
14457	Faris Hany Ibrahim Soliman	Salma Youssry			10 / 5 / 2026	Germany T Alex	farissoliman2003@outlook.com	Asd123456asd@		
17331	Abanoub Adel Thabet Nour Ibrahim	Nasser			10 / 5 / 2026	Germany T Alex	AbanoubIbrahim@mgmailz.com	AppointmentsMG123@		
14077	Mahmoud Salah Mahmoud Abdalla	Salma Youssry			10 / 5 / 2026	Germany B	mahmoud.abdalla@mgmailz.com	AppointmentsMG123@		
20589	Wael Rafaat Helmay Gawargy	Salma Ibrahim 	Mr Hamza 		12 / 5 / 2026	Germany T Alex	ghobraildaniel@gmail.com	Aa@123456		
16118	Nada Mahmoud Abdelhamid Lela	Salma Ibrahim 			20 / 5 / 2026	France  T	nadalela442@gmail.com	Nada@12345		
18668	Mohamed Abouelyazid Ahmed  Gad	Salma Youssry	Hussein		25/ 5 / 2026	Germany B	mohamedgad@mgmailz.com	AppointmentsMG123@		
16568	Peter Amir Fawzy Guirguis	Moعtaz			01/06/2026 	Germany B	PeterGuirguis@mgmailz.com	AppointmentsMG123@		
4553	Mahmoud Sayed Ahmed Attia        				02/06/2026 	Germany T Alex	MahmoudAttia@mgmailz.com	AppointmentsMG1231@		
21169	Hashim Jumaa Jubartalla Ahmed 	Moعtaz			02/06/2026 	Germany  B	hashim.ahmed@mgmailz.com	AppointmentsMG123@		
12507	Gamal Mohamed Othman Elsayed	Salma Youssry			06/06/2026 	France  T	gamalelsayed11@mgmailz.com	AppointmentsMG123@		
20032	Mazen Hossam Hussein Sallam   971526354111 \u0648\u0627\u0644\u062f \u0627\u0644\u0639\u0645\u064a\u0644 HOSSAM SALLAM				07/06/2026 	Germany T Alex	HOSSAMSALLAM@mgmailz.com	Ahmedossary1@		
20252	Maha Helmi Abdou Kasira And Her Son			\u0645\u064a\u0639\u0627\u062f \u0627\u0644\u0627\u0645 \u0627\u0644\u0633\u0627\u0639\u0647 : 11 \u0645\u064a\u0639\u0627\u062f \u0627\u0644\u0627\u0628\u0646 \u0627\u0644\u0633\u0627\u0639\u0647 : 10	09/06/2026 	Germany T Alex	MahaKasira@mgmailz.com mohamed.farag@mgmailz.com	AppointmentsMG1@		
21992	Mina Yonan Mounir Fanawil				09/06/2026 	Germany B	mina.fanawil@mgmailz.com	AppointmentsMG123@		
18279	Mohamed Ahmed Ali Abdelaal				14/06/2026 	Germany T Alex	mohamedabdelaal@mgmailz.com	AppointmentsMG1@		
14044	Ibrahim Hamada Ibrahim Elsamanoudy				14/06/2026 	Germany T Alex	IbrahimElsamanoudy@mgmailz.com	AppointmentsMG1@		
20483	Khaled Abdelrahman Mohamed Bakri				16/06/2026 	Germany T Alex	KhaledBakri@mgmailz.com	AppointmentsMG1@		
18028	Ali Ibrahim Mohamed Mamdour				18/06/2026 	Germany T Alex	alimamdour@mgmailz.com	AppointmentsMG1@		
19914	Osama Afify Elsayed Mohamed Abdalla				18/06/2026 	Germany T Alex	OsamaAbdalla123@mgmailz.com	AppointmentsMG1@		
17199	OMAR ELMITWALLI And HIS MOTHER \u0645\u064a\u0639\u0627\u062f \u0627\u0644\u0627\u0628\u0646				18/06/2026 	Germany T Alex	OmarHassan1@mgmailz.com	AppointmentsMG1@		
17199	Samar Elmahdi Fouad Abdou Hassan  \u0645\u064a\u0639\u0627\u062f \u0627\u0644\u0627\u0645			 	21/06/2026 	Germany T Alex	SamarHassan@mgmailz.com	AppointmentsMG1@		
8791	Hesham Abouelnasr Ibrahim Hegazi And His Son                               \u062d\u062c\u0632 \u0645\u064a\u0639\u0627\u062f\u064a\u0646 \u0627\u0644\u0645\u0627\u0646\u064a\u0627 \u0633\u064a\u0627\u062d\u0647 \u0641\u0631\u0639 \u0627\u0644\u0627\u0633\u0643\u0646\u062f\u0631\u064a\u0647				23/06/2026 \u0627\u0644\u0627\u0628 25/06/2026 \u0627\u0644\u0627\u0628\u0646 	Germany T Alex	heshamhegazi@mgmailz.com baherHegazi@mgmailz.com	AppointmentsMG1@		
19881	Abanoub Saad Tawfik Gad Elsayed				23/06/2026 	Germany T Alex	abanoubgadelsayed@mgmailz.com	AppointmentsMG1@		
19584	Hany Magdy Metwaly Mansour				25/06/2026 	Germany T Alex	hanymansour1@mgmailz.com	AppointmentsMG1@		
12144	Alaa Mohamed Mohamed Youssef Hassane				28/06/2026 		alaa.hassane@mgmailz.com	AppointmentsMG123@`;

export async function GET(request) {
  try {
    await dbConnect();
    
    // Create new users if they don't exist
    const usersCreated = [];
    const results = [];
    const mappingUserNamesToId = {};

    let users = await User.find({});
    users.forEach(u => mappingUserNamesToId[u.name.toLowerCase().trim()] = u._id);

    // Default file holder logic (create user if missing)
    const getFileHolderId = async (name) => {
      if (!name) return null;
      let cleanName = name.trim();
      let lowerName = cleanName.toLowerCase();
      
      if (mappingUserNamesToId[lowerName]) {
        return mappingUserNamesToId[lowerName];
      }
      
      // if not found, create new employee
      const username = cleanName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user_' + Math.random().toString(36).substring(7);
      
      const u = await User.create({
        name: cleanName,
        username: username,
        password: '$2a$10$T1K1w.t.Qf786E4T1D.TGe8Zg6z/v2nF9.G6o5wNl2z2o1aN2k0.S', // hashed 'password'
        role: 'employee'
      });
      mappingUserNamesToId[lowerName] = u._id;
      usersCreated.push(cleanName);
      return u._id;
    };

    const lines = dataStr.trim().split('\n');
    let matched = 0;
    
    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 2) continue;
      
      const odooId = parts[0].trim();
      const clientName = parts[1].trim();
      const fileHolderStr = parts[2]?.trim() || '';
      const followUpStr = parts[3]?.trim() || '';
      
      let fileHolderId = await getFileHolderId(fileHolderStr);
      
      const cases = await Case.find({ odooId });
      
      if (cases.length > 0) {
        // Update all similar cases by odooId and name?  
        // We will just update by odooId since multiple exist
        for (const c of cases) {
          if (fileHolderId) {
            c.createdBy = fileHolderId;
          }
          if (fileHolderStr === '') {
             // wait, if "there is no name (...) leave it blank"? We can't have an empty 'createdBy' because it's required (Schema).
             // Let's create an "Unassigned" user if fileHolderStr is empty? Or keep existing? 
             // "for the files that there is no name or follow up name leave it blank"
             // if it's blank we should ideally use existing or a default user. I will skip overriding createdBy if it's blank.
          }
          
          c.followUpName = followUpStr || '';
          
          await c.save();
          matched++;
        }
      }
    }

    return NextResponse.json({
       success: true,
       updatedCasesCount: matched,
       usersCreated,
    });
  } catch (error) {
     console.error('Migration error:', error);
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
