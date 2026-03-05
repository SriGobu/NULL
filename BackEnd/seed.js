require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

// Dummy data
const dummyUsers = [
    {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'password123'
    },
    {
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'password123'
    },
    {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: 'password123'
    },
    {
        name: 'David Wilson',
        email: 'david@example.com',
        password: 'password123'
    },
    {
        name: 'Emma Brown',
        email: 'emma@example.com',
        password: 'password123'
    }
];

const postTitles = [
    'Getting Started with Node.js',
    'Understanding React Hooks',
    'MongoDB Best Practices',
    'CSS Grid vs Flexbox',
    'JavaScript Async/Await Guide',
    'Web Security Essentials',
    'Building REST APIs',
    'Docker for Beginners',
    'Machine Learning Basics',
    'Cloud Computing Overview'
];

const postContents = [
    'Node.js is a powerful JavaScript runtime that allows you to build server-side applications. In this post, we\'ll explore the fundamentals of Node.js and how to get started with your first application.',
    'React Hooks have revolutionized the way we write React components. They allow you to use state and other React features in functional components, making code more reusable and easier to understand.',
    'MongoDB is a popular NoSQL database that stores data in a flexible JSON-like format. Here are some best practices to follow when working with MongoDB in your applications.',
    'CSS Grid and Flexbox are two powerful layout systems in CSS. Learn the differences between them and when to use each one for optimal responsive design.',
    'Async/await is a modern way to handle asynchronous code in JavaScript. It makes your code look and behave more like synchronous code, making it easier to understand and debug.',
    'Web security is crucial for protecting your applications and users. In this post, we\'ll cover essential security practices including HTTPS, CORS, and input validation.',
    'Building a REST API is a fundamental skill for web developers. Learn how to design, implement, and test a robust REST API using Node.js and Express.',
    'Docker containers have changed the way we deploy applications. Discover how Docker works and how to containerize your applications for easy deployment.',
    'Machine Learning is transforming industries across the world. Start your journey into ML with these fundamental concepts and tools for beginners.',
    'Cloud computing offers scalability, flexibility, and cost-effective solutions. Explore the major cloud platforms and their services.'
];

const categories = ['Technology', 'Web Development', 'Programming', 'Data Science', 'DevOps', 'Other'];

// Generate random likes
function generateRandomLikes(userIds) {
    const likes = [];
    const numLikes = Math.floor(Math.random() * userIds.length);
    const selectedUserIds = userIds.sort(() => 0.5 - Math.random()).slice(0, numLikes);
    
    for (let userId of selectedUserIds) {
        likes.push({ userId: userId });
    }
    return likes;
}

// Generate random comments
function generateRandomComments(users, postIndex) {
    const comments = [];
    const numComments = Math.floor(Math.random() * 3); // 0-2 comments per post
    
    for (let i = 0; i < numComments; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const commentTexts = [
            'Great post! Really helpful.',
            'Thanks for sharing this information!',
            'I completely agree with this perspective.',
            'This is exactly what I was looking for.',
            'Well written and informative.',
            'Looking forward to more posts like this!',
            'This helped me solve my problem!',
            'Excellent explanation!'
        ];
        
        comments.push({
            userId: randomUser._id,
            userName: randomUser.name,
            userEmail: randomUser.email,
            content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
            createdAt: new Date(Date.now() - Math.random() * 604800000) // Random time within last 7 days
        });
    }
    return comments;
}

// Seed database
async function seedDatabase() {
    try {
        // Connect to database
        const mongoURL = process.env.MONGODB_URL;
        await mongoose.connect(mongoURL);
        
        console.log('🗑️  Clearing database...');
        await User.deleteMany({});
        await Post.deleteMany({});
        
        console.log('👥 Creating dummy users...');
        const createdUsers = await User.create(dummyUsers);
        console.log(`✅ Created ${createdUsers.length} users`);
        
        console.log('📝 Creating dummy posts...');
        let totalPosts = 0;
        
        for (let i = 0; i < createdUsers.length; i++) {
            const user = createdUsers[i];
            // Each user creates 4-6 posts
            const numPosts = Math.floor(Math.random() * 3) + 4;
            
            for (let j = 0; j < numPosts; j++) {
                const titleIndex = (i * 6 + j) % postTitles.length;
                const contentIndex = (i * 6 + j) % postContents.length;
                const categoryIndex = Math.floor(Math.random() * categories.length);
                
                const post = new Post({
                    userId: user._id,
                    title: `${postTitles[titleIndex]} - ${user.name}'s Take`,
                    content: postContents[contentIndex],
                    category: categories[categoryIndex],
                    likes: generateRandomLikes(createdUsers.map(u => u._id)),
                    comments: generateRandomComments(createdUsers, j),
                    createdAt: new Date(Date.now() - Math.random() * 2592000000), // Random time within last 30 days
                    updatedAt: new Date()
                });
                
                await post.save();
                totalPosts++;
            }
        }
        
        console.log(`✅ Created ${totalPosts} posts with likes and comments`);
        
        // Display summary statistics
        console.log('\n📊 Database Summary:');
        console.log(`   Users: ${createdUsers.length}`);
        console.log(`   Posts: ${totalPosts}`);
        
        // Show user credentials
        console.log('\n🔑 Test User Credentials:');
        dummyUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. Email: ${user.email} | Password: ${user.password}`);
        });
        
        console.log('\n✨ Database seeding completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run seed function
seedDatabase();
