import bcrypt from 'bcryptjs';
import { connectFirestore, getDb } from './config/firebase.js';

const RAW_STUDENTS = `
00114004425 Priyanshu Mohta SANDEEP MOHTA
00214004425 Ayush Gandhi HEMANT GANDHI
00314004425 Ujjawal Parashar BRIJESH KR SHARMA
00414004425 Dimple Dhaulakhandi VANSHI DHAR
00514004425 Anshul Sharma MANOJ SHARMA
00614004425 Naman Gupta RAJEEV KUMAR GUPTA
00714004425 Manya Mittal SUSHIL MITTAL
00814004425 Namit Joshi LEELA DHAR
00914004425 Naina NARESH AGGARWAL
01014004425 Vibhor GUARDIAN - SACHIN
01114004425 Aditya AMAR KUMAR
01214004425 Prabhjyot Singh GURDEEP SINGH
01314004425 Paras Sharma NITIN
01414004425 Mayur Prabhakar Suryawanshi PRABHAKAR FATTU SURYAWANSHI
01514004425 Varun Malik SUNIL MALIK
01614004425 Aman KARAM CHAND
01714004425 Adiva MANJESH KUMAR
01814004425 Aditi Tanwar PRAVEEN TANWAR
01914004425 Kunal Gupta SURESH CHANDER GUPTA
02014004425 Vaani Rana VIPIN RANA
02114004425 Kritika Yadav SUSHIL KUMAR YADAV
02214004425 Gaurav Arora LALIT ARORA
02314004425 Deepika Thapliyal HARISH CHANDRA SINGH
02414004425 Rohan Kumar Rawat DALIP KUMAR RAWAT
02514004425 Jai Vijayran PRADEEP KUMAR VEGIAN
02614004425 Raunaq Gupta HONEY GUPTA
02714004425 Kanan VIRENDER SINGH
02814004425 Vertika Singh DILEEP KUMAR SINGH
02914004425 Piyush Verma SANT LAL
03014004425 Ananya Arora HITESH ARORA
03114004425 Rahul Bhatiya RAKESH KUMAR
03214004425 Mayank Tyagi BALKISHAN SINGH
03314004425 Kritika Gupta GIRISH KR GUPTA
03414004425 Shahnawaaz Hussain ATTAR HOSSAIN
03514004425 Ashutosh Mishra ALOK MISHRA
03614004425 Bhavishay NARESH KUMAR
03714004425 Neha PRAMOD KUMAR
03814004425 Priyanshu Rana RAJEEV KUMAR RANA
03914004425 Vansh Vij ANIL KUMAR VIJ
04014004425 Sheﬀali Sethi RAJESH SETHI
04114004425 Mahak Arora SUNIL ARORA
04214004425 Daksh Rathi SATISH KUMAR
04314004425 Yashika Bedi JITENDER BEDI
04414004425 Gagandeep Singh RANJIT SINGH
04514004425 Aditya Basu KAMAL KISHOR
04614004425 Ajeet Singh UPKAR SINGH
04714004425 Pushpansh Pandey ANIL PANDEY
04814004425 Abhipriya Bhardwaj SUNEEL KUMAR BHARDWAJ
04914004425 Ashwani Kumar Puri NAGENDER PURI
05014004425 Siddharth Gupta PARVESH GUPTA
05114004425 Vidushi Arora KRISHAN ARORA
05214004425 Paras KRISHAN KUMAR
05314004425 Prashant Shukla SURAJ PRAKASH SHUKLA
05414004425 Priyanshu Mittal PURUSHOTTAM MITTAL
05514004425 Chhavi Vats KAILASH VATS
05614004425 Raghav Tyagi SANJAY TYAGI
05714004425 Makhija Charmi Nareshbhai MAKHIJA NARESHBHAI
05814004425 Vaibhav Sharma SURESH KUMAR SHARMA
05914004425 Kaushal Kumar UMESH KUMAR
06014004425 Mir Anish MIR NASIRUDDIN
06114004425 Varun Sharma PARVEEN KUMAR
06214004425 Aastha Setia RAMESH SETIA
06314004425 Mayank Sharma VINOD KUMAR SHARMA
06414004425 Yash Tyagi BODHRAJ TYAGI
06514004425 Aarya Krishnan HARI KRISHNAN
06614004425 Ashneet Kaur Kochhar RAJPREET SINGH KOCHHAR
06714004425 Mehak Garg GHANSHYAM GARG
06814004425 Krish Khandelwal MANOJ GUPTA
06914004425 Adarsh Sharma DHARAM PAL
07014004425 Akash Budhiraja BHUPENDER BUDHIRAJA
07114004425 Sanskriti VIPIN KUMAR
07214004425 Ishita Dass JONATHAN DASS
07314004425 Ayush Mishra SANDEEP MISHRA
07414004425 Vidhi Singhal MADAN GOPAL SINGHAL
07514004425 Tushar Vashisht SAT PRAKASH
07614004425 Shankar Suman Singh Parmar HEMANT SINGH PARMAR
07714004425 Tarun Vashishth MANOJ KUMAR SHARMA
07814004425 Yuvraj Paudel LATE D.P.SHARMA
07914004425 Shailly Panwar PARVESH KUMAR
08014004425 Anurag Rathore AJAY RATHORE
08114004425 R Kartikeyan M B RAMESH KUMAR
08214004425 Avighyat Srivastav PRAVIN KUMAR
08314004425 Nikhil Kumar Luhaniya PRAMOD KUMAR
08414004425 Bhavya Bhutani RAJAN BHUTANI
08514004425 Gaurav Kumar JANARDAN PRASAD
08614004425 Vaibhav Gupta JAI PRAKASH GUPTA
08714004425 Paarth Kumar PRADEEP KUMAR
08814004425 Mehak Baisoya VINOD BAISOYA
08914004425 Jyoti Bisht MADHO SINGH
09014004425 Abhishek Bhalla GOVIND RAM BHALLA
09114004425 Kashish SATISH KUMAR
09214004425 Saransh Thanik ANIL KUMAR THANIK
09314004425 Manish Kumar DHARMENDRA MANJHI
09414004425 Hardik Dhawan JATINDER DHAWAN
09514004425 Harsh Jain SUNIL JAIN
09614004425 Pratyush Vashishtha SUNIL KUMAR VASHISHTHA
09714004425 Nipun Gupta JUGAN GUPTA
09814004425 Sanyam Kumar DEVENDER KUMAR
09914004425 Khushi Sharma ANIL SHARMA
10014004425 Vanshika Gupta PRAVEEN GUPTA
10114004425 Rishabh Rustagi SANJEEV KUMAR RUSTAGI
10214004425 Varun Wason NAVEEN WASON
10314004425 Jiya Jaisingh NARENDER KUMAR
10414004425 Shreya Singhal AJAY SINGHAL
10514004425 Shivam Pal ARVIND PAL
10614004425 Akshit Chawla AMIT CHAWLA
10714004425 Aniket Singhal PRAVEEN SINGHAL
10814004425 Shubham Rana KULDEEP SINGH
10914004425 Samikshya Ray PRASANTA KUMAR RAY
11014004425 Shivansh Chhibber PARDEEP CHHIBBER
11114004425 Lakshay ATUL
11214004425 Rupanshi Varshney VISHAL VARSHNEY
11314004425 Diya Jain PANKAJ JAIN
11414004425 Divyanshi Singh ARVIND SINGH
11514004425 Jaiyant Singh Rawat UMESH SINGH RAWAT
11614004425 Ridhima Tripathi SUSHIL TRIPATHI
11714004425 Vanshika LALIT BATRA
11814004425 Rishabh Verma RANJIT KUMAR VERMA
11914004425 Shreshthi Suman SHITAL PRASAD SUMAN
12014004425 Manisha Sharma RAJIV KUMAR SHARMA
00150404425 Abhay Garg ASHOK KUMAR GARG
00250404425 Mohit ROSHAN LAL
00350404425 Tamanna CHHOTU RAM
00450404425 Gautam Garg HIMANSHU GARG
00550404425 Kashish Sanwal MUKESH SANWAL
00650404425 Manya Gupta BHARAT GUPTA
00750404425 Khemendra Singh Khangarot DHARMENDRA SINGH
00850404425 Ishaan Sharma NAVIN KUMAR SHARMA
00950404425 Varun Bundela VIRENDER KUMAR
01050404425 Abhimanyu Khokhar RANDEEP KHOKHAR
01150404425 Ayush Kothari VINOD KUMAR KOTHARI
01250404425 Dhruv Malhotra ASHISH MALHOTRA
01350404425 Silky Nijhawan NEERAJ NIJHAWAN
01450404425 Pallak Anand VISHAL ANAND
01550404425 Tanishk Pahwa SATYA PAHWA
01650404425 Ishika Jindal RAKESH JINDAL
01750404425 Dhruv Bhatia VISHAL BHATIA
01850404425 Satvik Kapoor ASHOK KAPOOR
01950404425 Vansh VIJAY AGGARWAL
02050404425 Karandeep Singh AMARDEEP SINGH
02150404425 Deepanshu DEEPAK KUMAR
02250404425 Manan Sehgal VINEET SEHGAL
02350404425 Harsh Gupta MUKESH KUMAR GUPTA
02450404425 Aayush Kansal RAHUL KANSAL
02550404425 Sahil Kumar ANIL KUMAR
02650404425 Chhavi Takroo UMESH TAKROO
02750404425 Varun Bhatia VINOD KUMAR BHATIA
02850404425 Ansh Tanwar AMIT TANWAR
02950404425 Raskirat Singh AMARPREET SINGH
03050404425 Shaurya Sharma PRAMOD KUMAR
03150404425 Vansh Goyal MUKESH CHAND GOYAL
03250404425 Khushi Kapoor MOHIT KAPOOR
03350404425 Shivam Gupta RAJESH GUPTA
03450404425 Yuvika Batra MR. BAL KISHAN
03550404425 Arpit Bansal PAWAN KUMAR BANSAL
03650404425 Rishabh Devrani ASHOK DEVRANI
03750404425 Mohit Sharma SUNIL KUMAR SHARMA
03850404425 Aditya Singh AJAY KUMAR SINGH
03950404425 Nikhil SHRI KRISHAN
04050404425 Rishi Tomer RAKESH TOMER
04150404425 Pranay Kasana HARISH KASANA
04250404425 Anshika Jain AMIT JAIN
04350404425 Rahul MAHESH
04450404425 Sarvesh Bhardwaj SANJAY BHARDWAJ
04550404425 Harsimar Singh HARVINDER SINGH
`.trim();

function parseStudents() {
  const lines = RAW_STUDENTS.split('\n').map(l => l.trim()).filter(Boolean);
  const students = [];

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;
    const enrollment = parts[0];
    const tokens = parts.slice(1);

    // Find boundary between student Name (Title Case) and Father's Name (ALL CAPS)
    // Find index of first uppercase token
    let fatherStartIdx = -1;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      // Check if token is all-caps (ignoring hyphens, periods, etc.)
      const letters = t.replace(/[^A-Za-z]/g, '');
      if (letters.length > 0 && letters === letters.toUpperCase()) {
        fatherStartIdx = i;
        break;
      }
    }

    if (fatherStartIdx > 0) {
      const studentName = tokens.slice(0, fatherStartIdx).join(' ');
      const fatherName = tokens.slice(fatherStartIdx).join(' ').toUpperCase();
      students.push({
        enrollmentNumber: enrollment,
        name: studentName,
        fatherName: fatherName,
        username: `${enrollment}_${studentName}`,
        email: `${enrollment.toLowerCase()}@jims.edu`
      });
    } else {
      // Fallback
      const studentName = tokens[0];
      const fatherName = tokens.slice(1).join(' ').toUpperCase();
      students.push({
        enrollmentNumber: enrollment,
        name: studentName,
        fatherName: fatherName,
        username: `${enrollment}_${studentName}`,
        email: `${enrollment.toLowerCase()}@jims.edu`
      });
    }
  }

  return students;
}

export async function seedAllStudents() {
  console.log('[Seed] Initializing Firestore connection...');
  const db = await connectFirestore();
  const students = parseStudents();
  console.log(`[Seed] Parsed ${students.length} students from master record.`);

  const usersCollection = db.collection('users');
  const salt = await bcrypt.genSalt(10);
  
  // Use batch write in chunks of 450 (Firestore limit is 500 ops per batch)
  const batchSize = 100;
  let addedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < students.length; i += batchSize) {
    const chunk = students.slice(i, i + batchSize);
    const batch = db.batch();

    for (const student of chunk) {
      const docId = `student_${student.enrollmentNumber}`;
      const docRef = usersCollection.doc(docId);
      
      const hashedPassword = await bcrypt.hash(student.fatherName, salt);
      const studentDoc = {
        _id: docId,
        enrollmentNumber: student.enrollmentNumber,
        name: student.name,
        fatherName: student.fatherName,
        username: student.username,
        email: student.email,
        role: 'student',
        department: 'MCA Department',
        password: hashedPassword,
        program: student.enrollmentNumber.includes('50404425') ? 'MCA Shift-2' : 'MCA Shift-1',
        isActive: true,
        updatedAt: new Date().toISOString()
      };

      batch.set(docRef, studentDoc, { merge: true });
      addedCount++;
    }

    await batch.commit();
    console.log(`[Seed] Committed batch ${Math.floor(i / batchSize) + 1} (${chunk.length} students)`);
  }

  // Also ensure standard generic roles exist:
  // Faculty, Technician, Helper, Admin
  const standardUsers = [
    {
      _id: 'user_faculty_standard',
      name: 'Faculty / Staff',
      email: 'faculty@jims.edu',
      role: 'staff',
      department: 'MCA Department',
      phone: '+91 98110 11223',
      password: await bcrypt.hash('faculty123', salt),
      isActive: true,
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'user_tech_standard',
      name: 'Technician / Assistant',
      email: 'technician@jims.edu',
      role: 'technician',
      department: 'Facilities & Maintenance',
      trade: 'All Trades',
      phone: '+91 98101 44556',
      password: await bcrypt.hash('tech123', salt),
      isActive: true,
      updatedAt: new Date().toISOString()
    },
    {
      _id: 'user_admin_standard',
      name: 'Campus Administrator',
      email: 'admin@jims.edu',
      role: 'admin',
      department: 'Facility Management Division',
      phone: '+91 98111 88990',
      password: await bcrypt.hash('admin123', salt),
      isActive: true,
      updatedAt: new Date().toISOString()
    }
  ];

  const standardBatch = db.batch();
  for (const su of standardUsers) {
    const docRef = usersCollection.doc(su._id);
    standardBatch.set(docRef, su, { merge: true });
  }
  await standardBatch.commit();
  console.log('[Seed] Standard generic accounts seeded (faculty, technician, admin).');

  console.log(`[Seed] Successfully seeded ${addedCount} students + 3 standard roles into Firebase Firestore!`);
  return { studentsCount: students.length, addedCount };
}

// Allow direct CLI execution
if (process.argv[1] && process.argv[1].endsWith('seedStudents.js')) {
  seedAllStudents()
    .then(res => {
      console.log('Done!', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

