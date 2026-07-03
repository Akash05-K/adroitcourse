// Run with: npm run seed         (inserts sample courses)
//           npm run seed:destroy (wipes courses collection)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Course = require('./models/Course');

const courses = [
  {
    title: 'Full-Stack Web Development with MERN',
    description: 'Master MongoDB, Express, React and Node by building real production-grade applications from scratch.',
    duration: '3 months',
    dailyTiming: '6:00 PM - 8:00 PM',
    totalSeats: 60,
    vacantSeats: 42,
    price: 299,
    instructor: { name: 'Ananya Sharma', bio: '8+ yrs full-stack engineer', photo: '' },
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
    category: 'Web Development',
    level: 'Intermediate',
    studentsCount: 4230,
    certificateIncluded: true,
    ratings: { average: 4.7, count: 312 },
  },
  {
    title: 'Data Structures & Algorithms Masterclass',
    description: 'Crack coding interviews with in-depth DSA concepts, problem patterns, and mock interviews.',
    duration: '45 days',
    dailyTiming: '7:00 PM - 9:00 PM',
    totalSeats: 100,
    vacantSeats: 5,
    price: 199,
    instructor: { name: 'Rahul Verma', bio: 'Ex-FAANG SDE', photo: '' },
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop',
    category: 'Web Development',
    level: 'Advanced',
    studentsCount: 8890,
    certificateIncluded: true,
    ratings: { average: 4.9, count: 890 },
  },
  {
    title: 'Python for Data Science & Machine Learning',
    description: 'Learn Python, Pandas, NumPy, and scikit-learn to build real machine learning models.',
    duration: '2 months',
    dailyTiming: '5:00 PM - 7:00 PM',
    totalSeats: 80,
    vacantSeats: 80,
    price: 249,
    instructor: { name: 'Priya Nair', bio: 'Data Scientist, 6 yrs experience', photo: '' },
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop',
    category: 'Data Science',
    level: 'Beginner',
    studentsCount: 2010,
    certificateIncluded: true,
    ratings: { average: 4.6, count: 201 },
  },
  {
    title: 'UI/UX Design Fundamentals with Figma',
    description: 'Design beautiful, user-centered digital products using industry-standard tools and workflows.',
    duration: '30 days',
    dailyTiming: '8:00 PM - 9:30 PM',
    totalSeats: 50,
    vacantSeats: 0,
    price: 149,
    instructor: { name: 'Kabir Malhotra', bio: 'Senior Product Designer', photo: '' },
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    category: 'Design',
    level: 'Beginner',
    studentsCount: 1450,
    certificateIncluded: true,
    ratings: { average: 4.5, count: 145 },
  },
  {
    title: 'AWS Cloud Practitioner Certification',
    description: 'Build a strong foundation in AWS cloud services and pass the certification exam with confidence.',
    duration: '6 weeks',
    dailyTiming: '6:30 PM - 8:00 PM',
    totalSeats: 70,
    vacantSeats: 23,
    price: 179,
    instructor: { name: 'Sanjay Iyer', bio: 'AWS Certified Solutions Architect', photo: '' },
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    category: 'Cloud Computing',
    level: 'Intermediate',
    studentsCount: 980,
    certificateIncluded: true,
    ratings: { average: 4.4, count: 98 },
  },
  {
    title: 'Digital Marketing & SEO Bootcamp',
    description: 'Learn SEO, social media marketing, Google Ads, and analytics to grow any brand online.',
    duration: '1 month',
    dailyTiming: '7:30 PM - 9:00 PM',
    totalSeats: 90,
    vacantSeats: 61,
    price: 129,
    instructor: { name: 'Neha Kapoor', bio: 'Digital Marketing Consultant', photo: '' },
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    category: 'Marketing',
    level: 'Beginner',
    studentsCount: 1760,
    certificateIncluded: true,
    ratings: { average: 4.3, count: 176 },
  },
  {
    title: 'Advanced React & System Design',
    description: 'Deep dive into React performance, architecture patterns, and scalable front-end system design.',
    duration: '2 months',
    dailyTiming: '6:00 PM - 8:00 PM',
    totalSeats: 40,
    vacantSeats: 18,
    price: 279,
    instructor: { name: 'Ananya Sharma', bio: '8+ yrs full-stack engineer', photo: '' },
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop',
    category: 'Web Development',
    level: 'Advanced',
    studentsCount: 1330,
    certificateIncluded: true,
    ratings: { average: 4.8, count: 254 },
  },
  {
    title: 'Data Visualization with Tableau & Power BI',
    description: 'Turn raw data into compelling dashboards and stories using industry-standard BI tools.',
    duration: '5 weeks',
    dailyTiming: '5:30 PM - 7:00 PM',
    totalSeats: 55,
    vacantSeats: 1,
    price: 169,
    instructor: { name: 'Priya Nair', bio: 'Data Scientist, 6 yrs experience', photo: '' },
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    category: 'Data Science',
    level: 'Intermediate',
    studentsCount: 760,
    certificateIncluded: true,
    ratings: { average: 4.5, count: 88 },
  },
];

const importData = async () => {
  try {
    await connectDB();

    // Upsert each course by title instead of wiping and recreating everything.
    // This keeps each course's _id stable across repeated `npm run seed` runs,
    // which matters because Orders reference courses by _id — if courses got
    // new IDs on every reseed, a student re-purchasing the "same" course
    // (same title) after a reseed would bypass the duplicate-purchase check,
    // since it would look like a brand new course to the database.
    let created = 0;
    let updated = 0;

    for (const courseData of courses) {
      const existing = await Course.findOne({ title: courseData.title });

      if (existing) {
        // Preserve vacantSeats if it's been purchased down already;
        // only reset it if totalSeats changed (rare, dev-time schema tweak).
        const vacantSeats =
          existing.totalSeats === courseData.totalSeats ? existing.vacantSeats : courseData.totalSeats;

        await Course.updateOne(
          { _id: existing._id },
          { $set: { ...courseData, vacantSeats } }
        );
        updated++;
      } else {
        await Course.create({ ...courseData, vacantSeats: courseData.totalSeats });
        created++;
      }
    }

    console.log(`✅ Seed complete — ${created} course(s) created, ${updated} course(s) updated (IDs preserved)`);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Course.deleteMany();
    console.log('🗑️  All courses removed');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}