import { PostType, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Skills
  const skillsData = [
    { name: "Python", category: "Programming" },
    { name: "JavaScript", category: "Programming" },
    { name: "TypeScript", category: "Programming" },
    { name: "React", category: "Frontend" },
    { name: "Next.js", category: "Frontend" },
    { name: "Node.js", category: "Backend" },
    { name: "Machine Learning", category: "AI/ML" },
    { name: "Deep Learning", category: "AI/ML" },
    { name: "Data Science", category: "AI/ML" },
    { name: "UI/UX Design", category: "Design" },
    { name: "Figma", category: "Design" },
    { name: "PostgreSQL", category: "Database" },
    { name: "MongoDB", category: "Database" },
    { name: "Docker", category: "DevOps" },
    { name: "AWS", category: "Cloud" },
    { name: "Java", category: "Programming" },
    { name: "C++", category: "Programming" },
    { name: "Rust", category: "Programming" },
    { name: "Go", category: "Programming" },
    { name: "Flutter", category: "Mobile" },
    { name: "Swift", category: "Mobile" },
    { name: "Kotlin", category: "Mobile" },
    { name: "TensorFlow", category: "AI/ML" },
    { name: "PyTorch", category: "AI/ML" },
    { name: "GraphQL", category: "API" },
    { name: "REST API", category: "API" },
    { name: "Cybersecurity", category: "Security" },
    { name: "Blockchain", category: "Web3" },
    { name: "Computer Vision", category: "AI/ML" },
    { name: "NLP", category: "AI/ML" },
  ];

  const skills = await Promise.all(
    skillsData.map((s) =>
      prisma.skill.upsert({
        where: { name: s.name },
        update: {},
        create: s,
      })
    )
  );
  console.log(`✅ Created ${skills.length} skills`);

  // Users
  const hashedPassword = await bcrypt.hash("password123", 10);
  const universities = [
    "MIT", "Stanford University", "IIT Delhi", "IIT Bombay",
    "University of Cambridge", "ETH Zurich", "NUS Singapore",
    "University of Tokyo", "UC Berkeley", "Carnegie Mellon",
  ];
  const departments = [
    "Computer Science", "Electrical Engineering", "Data Science",
    "Mathematics", "Physics", "Mechanical Engineering",
    "Information Technology", "Artificial Intelligence",
    "Software Engineering", "Biomedical Engineering",
  ];
  const names = [
    "Arjun Mehta", "Sophia Chen", "Liam O'Brien", "Priya Sharma",
    "Carlos Rivera", "Yuki Tanaka", "Emma Schmidt", "Ravi Patel",
    "Aisha Khan", "Lucas Martin",
  ];

  const users = await Promise.all(
    names.map((name, i) =>
      prisma.user.upsert({
        where: { email: `${name.split(" ")[0].toLowerCase()}@clonnect.dev` },
        update: {},
        create: {
          name,
          email: `${name.split(" ")[0].toLowerCase()}@clonnect.dev`,
          username: name.split(" ")[0].toLowerCase() + (i + 1),
          passwordHash: hashedPassword,
          image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${name.replace(/ /g, "")}`,
          university: universities[i],
          department: departments[i],
          year: (i % 4) + 1,
          bio: `Passionate ${departments[i]} student at ${universities[i]}. Love building cool stuff and learning new technologies!`,
        },
      })
    )
  );
  console.log(`✅ Created ${users.length} users`);

  // UserSkills
  for (const user of users) {
    const randomSkills = skills
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 4));
    for (const skill of randomSkills) {
      await prisma.userSkill.upsert({
        where: { userId_skillId: { userId: user.id, skillId: skill.id } },
        update: {},
        create: {
          userId: user.id,
          skillId: skill.id,
          proficiencyLevel: Math.floor(Math.random() * 5) + 1,
        },
      });
    }
  }
  console.log("✅ Assigned skills to users");

  // Posts
  const postData = [
    { type: PostType.HELP_REQUEST, title: "Need help with React Server Components", content: "I'm trying to understand the difference between server and client components in Next.js 15. Can someone explain when to use 'use client' vs keeping it as a server component? I keep getting hydration errors.", isUrgent: true, tags: ["React", "Next.js", "Help"] },
    { type: PostType.RESOURCE, title: "Complete Machine Learning Roadmap 2026", content: "Hey everyone! I've compiled a comprehensive ML roadmap covering everything from linear algebra basics to advanced deep learning architectures. Includes curated resources, projects, and timelines. Check it out!", isUrgent: false, tags: ["Machine Learning", "AI", "Roadmap"] },
    { type: PostType.GENERAL, title: "Just deployed my first full-stack app! 🚀", content: "After 3 months of learning Next.js and PostgreSQL, I finally deployed my first app. It's a campus event tracker. Would love feedback from the community!", isUrgent: false, tags: ["Milestone", "Next.js", "PostgreSQL"] },
    { type: PostType.HELP_REQUEST, title: "Docker compose not working with PostgreSQL", content: "My docker-compose.yml keeps failing when trying to connect the Node.js container to PostgreSQL. Getting 'ECONNREFUSED' errors. Anyone experienced this?", isUrgent: true, tags: ["Docker", "PostgreSQL", "DevOps"] },
    { type: PostType.RESOURCE, title: "Free UI/UX Design Course Notes", content: "Sharing my detailed notes from a UI/UX design course. Covers Gestalt principles, color theory, typography, wireframing, prototyping in Figma, and user research methods.", isUrgent: false, tags: ["Design", "Figma", "UI/UX"] },
    { type: PostType.GENERAL, title: "Looking for project collaborators — AI Chat Bot", content: "Building an AI-powered study assistant chatbot using GPT-4 API. Need 2-3 teammates skilled in React, Python, or NLP. DM if interested!", isUrgent: false, tags: ["AI", "Collaboration", "Project"] },
    { type: PostType.HELP_REQUEST, title: "Recursion in Dynamic Programming — confused!", content: "I understand basic recursion but dynamic programming memoization is breaking my brain. Can someone walk me through the Knapsack problem step by step?", isUrgent: false, tags: ["Algorithms", "DP", "Help"] },
    { type: PostType.RESOURCE, title: "Git & GitHub Cheat Sheet for Beginners", content: "Made a visual cheat sheet covering git init, branching, merging, rebasing, cherry-pick, and PR workflows. Perfect for students just starting with version control.", isUrgent: false, tags: ["Git", "GitHub", "Beginners"] },
    { type: PostType.HELP_REQUEST, title: "AWS Lambda cold start too slow", content: "My Lambda functions are taking 5-8 seconds on cold start. Using Node.js 20 runtime with 512MB memory. Any tips for reducing cold start latency?", isUrgent: true, tags: ["AWS", "Lambda", "Performance"] },
    { type: PostType.GENERAL, title: "Campus Hackathon this weekend! 🏆", content: "Excited to announce CodeSprint 2026 happening this Saturday! 24-hour hackathon with prizes worth $5000. Open to all departments. Register link in comments.", isUrgent: false, tags: ["Hackathon", "Event", "Campus"] },
    { type: PostType.RESOURCE, title: "Data Structures Visualizer Tool", content: "Built an interactive web tool that visualizes common data structures — linked lists, trees, graphs, heaps. Great for exam prep. Live demo link included!", isUrgent: false, tags: ["Data Structures", "Visualization", "Tool"] },
    { type: PostType.HELP_REQUEST, title: "TypeScript generics making my head spin 🌀", content: "Trying to type a generic API response handler but keep getting type inference issues. How do you properly constrain generic types in TypeScript?", isUrgent: false, tags: ["TypeScript", "Generics", "Help"] },
    { type: PostType.GENERAL, title: "Study group for System Design interviews", content: "Starting a weekly study group for system design. We'll cover load balancing, caching, database sharding, and microservices. Join us every Thursday 7 PM!", isUrgent: false, tags: ["System Design", "Interview Prep", "Study Group"] },
    { type: PostType.RESOURCE, title: "Competitive Programming Problem Set", content: "Curated 100 problems from Codeforces and LeetCode organized by difficulty and topic. Includes solutions in C++ and Python with detailed explanations.", isUrgent: false, tags: ["CP", "LeetCode", "Algorithms"] },
    { type: PostType.HELP_REQUEST, title: "Flutter app crashing on iOS simulator", content: "My Flutter app works fine on Android but crashes on iOS with a 'Runner' error. Using latest stable channel. Already tried flutter clean. Any ideas?", isUrgent: true, tags: ["Flutter", "iOS", "Mobile"] },
    { type: PostType.GENERAL, title: "Internship experience at Google — AMA!", content: "Just finished my summer internship at Google working on Search infrastructure. Happy to answer questions about the application process, interview prep, and daily life at Google!", isUrgent: false, tags: ["Internship", "Google", "AMA"] },
    { type: PostType.RESOURCE, title: "Cybersecurity CTF Beginner Toolkit", content: "Compiled a starter kit for CTF competitions: tools (Burp Suite, Wireshark, John), practice platforms (HackTheBox, TryHackMe), and common vulnerability checklists.", isUrgent: false, tags: ["Cybersecurity", "CTF", "Security"] },
    { type: PostType.HELP_REQUEST, title: "Prisma migration failing silently", content: "Running npx prisma migrate dev creates the migration file but doesn't apply it to the database. No error messages. Database is PostgreSQL on Supabase. Help?", isUrgent: false, tags: ["Prisma", "PostgreSQL", "Database"] },
    { type: PostType.GENERAL, title: "Best laptop for CS students in 2026?", content: "Looking to buy a new laptop for development and ML model training. Budget is around $1500. Should I go with MacBook Air M4 or a Linux-friendly ThinkPad?", isUrgent: false, tags: ["Hardware", "Discussion", "Laptop"] },
    { type: PostType.RESOURCE, title: "Blockchain Development Crash Course Notes", content: "Sharing my notes from a Solidity + Ethereum development bootcamp. Covers smart contracts, ERC-20 tokens, DeFi protocols, and deploying to testnets.", isUrgent: false, tags: ["Blockchain", "Solidity", "Web3"] },
  ];

  for (let i = 0; i < postData.length; i++) {
    const post = postData[i];
    const author = users[i % users.length];
    const created = await prisma.post.create({
      data: {
        authorId: author.id,
        type: post.type,
        title: post.title,
        content: post.content,
        isUrgent: post.isUrgent,
        tags: {
          create: post.tags.map((t) => ({ tagName: t })),
        },
      },
    });

    // Add some likes and comments
    const likeUsers = users.filter((u) => u.id !== author.id).slice(0, 2 + Math.floor(Math.random() * 4));
    for (const u of likeUsers) {
      await prisma.like.create({
        data: { userId: u.id, postId: created.id },
      });
    }
  }
  console.log(`✅ Created ${postData.length} posts with likes`);

  // Follows
  for (const user of users) {
    const toFollow = users.filter((u) => u.id !== user.id).sort(() => Math.random() - 0.5).slice(0, 3);
    for (const f of toFollow) {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: user.id, followingId: f.id } },
        update: {},
        create: { followerId: user.id, followingId: f.id },
      });
    }
  }
  console.log("✅ Created follow relationships");

  // Notifications
  for (const user of users.slice(0, 5)) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.FOLLOW,
        message: `${users[(users.indexOf(user) + 1) % users.length].name} started following you!`,
        isRead: false,
      },
    });
  }
  console.log("✅ Created sample notifications");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
