import "dotenv/config";
import { $Enums } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding Clonnect database with MIT ADT University data...");

  // ═══ Skills ═══
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

  // ═══ Users — Real Indian names, MIT ADT University ═══
  const hashedPassword = await bcrypt.hash("password123", 10);

  const usersData = [
    {
      name: "Aryan Gulhane",
      email: "aryan@clonnect.dev",
      username: "aryangulhane",
      university: "MIT ADT University",
      department: "Computer Science",
      year: 3,
      bio: "Full-stack developer passionate about Next.js and React. Building Clonnect to connect campus communities. Love open-source and hackathons! 🚀",
      skillNames: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    },
    {
      name: "Aarav Deshmukh",
      email: "aarav@clonnect.dev",
      username: "aaravd",
      university: "MIT ADT University",
      department: "Artificial Intelligence",
      year: 4,
      bio: "AI researcher at MIT ADT. Working on computer vision and NLP. Published 2 papers in NeurIPS workshops. Always up for a chai and ML discussion ☕",
      skillNames: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "Computer Vision", "NLP"],
    },
    {
      name: "Sneha Kulkarni",
      email: "sneha@clonnect.dev",
      username: "snehak",
      university: "MIT ADT University",
      department: "Data Science",
      year: 3,
      bio: "Data Science enthusiast turning raw data into stories. Kaggle Expert 📊. Leading the MIT ADT Data Science Club. Let's explore data together!",
      skillNames: ["Python", "Data Science", "Machine Learning", "PostgreSQL", "PyTorch"],
    },
    {
      name: "Rohan Patil",
      email: "rohan@clonnect.dev",
      username: "rohanp",
      university: "MIT ADT University",
      department: "Computer Science",
      year: 2,
      bio: "Backend dev who loves system design and microservices. Currently building scalable APIs with Go and Rust. Competitive programmer on CodeChef 💻",
      skillNames: ["Go", "Rust", "Docker", "AWS", "PostgreSQL", "C++"],
    },
    {
      name: "Priya Sharma",
      email: "priya@clonnect.dev",
      username: "priyas",
      university: "MIT ADT University",
      department: "Information Technology",
      year: 3,
      bio: "UI/UX designer & frontend developer. Making the web beautiful one pixel at a time ✨. Figma community advocate. Love conducting design workshops!",
      skillNames: ["UI/UX Design", "Figma", "React", "TypeScript", "Flutter"],
    },
    {
      name: "Vedant Joshi",
      email: "vedant@clonnect.dev",
      username: "vedantj",
      university: "MIT ADT University",
      department: "Computer Science",
      year: 4,
      bio: "Full-stack developer interning at a Pune startup. Building with Next.js, Express, and MongoDB. Open to freelance and collaboration opportunities 🤝",
      skillNames: ["JavaScript", "Node.js", "React", "MongoDB", "GraphQL", "REST API"],
    },
    {
      name: "Ananya Bhosale",
      email: "ananya@clonnect.dev",
      username: "ananyab",
      university: "MIT ADT University",
      department: "Artificial Intelligence",
      year: 2,
      bio: "ML engineer in the making. Fascinated by GANs and generative AI. Contributing to Hugging Face repos. Campus AI club secretary 🤖",
      skillNames: ["Python", "Deep Learning", "PyTorch", "Machine Learning", "NLP"],
    },
    {
      name: "Aditya Kale",
      email: "aditya@clonnect.dev",
      username: "adityak",
      university: "MIT ADT University",
      department: "Software Engineering",
      year: 3,
      bio: "Mobile developer — Flutter & Kotlin. Published 3 apps on Play Store. DevOps enthusiast. Love mentoring juniors and organizing tech talks 📱",
      skillNames: ["Flutter", "Kotlin", "Java", "Docker", "AWS", "Swift"],
    },
    {
      name: "Ishita Wagh",
      email: "ishita@clonnect.dev",
      username: "ishitaw",
      university: "MIT ADT University",
      department: "Cybersecurity",
      year: 4,
      bio: "Cybersecurity researcher & CTF player. Ranked top 50 in HackTheBox India 🔐. Working on ethical hacking and network security. Bug bounty hunter!",
      skillNames: ["Cybersecurity", "Python", "C++", "Docker", "AWS"],
    },
    {
      name: "Sahil Mane",
      email: "sahil@clonnect.dev",
      username: "sahilm",
      university: "MIT ADT University",
      department: "Computer Science",
      year: 1,
      bio: "Freshman exploring everything tech! Currently learning React and Python. Love attending hackathons and making new connections. Let's build together! 🌟",
      skillNames: ["Python", "JavaScript", "React", "Java"],
    },
    {
      name: "Tanvi Deshpande",
      email: "tanvi@clonnect.dev",
      username: "tanvid",
      university: "MIT ADT University",
      department: "Data Science",
      year: 2,
      bio: "Aspiring data analyst with a passion for visualization. D3.js and Tableau lover 📈. Running the MIT ADT analytics blog. Always learning!",
      skillNames: ["Python", "Data Science", "PostgreSQL", "JavaScript", "Machine Learning"],
    },
    {
      name: "Harsh Gaikwad",
      email: "harsh@clonnect.dev",
      username: "harshg",
      university: "MIT ADT University",
      department: "Software Engineering",
      year: 3,
      bio: "Blockchain developer and Web3 enthusiast. Building DApps on Ethereum. Solidity smart contract developer. Crypto meetup organizer in Pune ⛓️",
      skillNames: ["Blockchain", "JavaScript", "Rust", "Node.js", "TypeScript"],
    },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name,
          email: u.email,
          username: u.username,
          passwordHash: hashedPassword,
          image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${u.username}`,
          university: u.university,
          department: u.department,
          year: u.year,
          bio: u.bio,
          xp: Math.floor(Math.random() * 500) + 100,
        },
      })
    )
  );
  console.log(`✅ Created ${users.length} users`);

  // ═══ UserSkills ═══
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const userData = usersData[i];
    for (const skillName of userData.skillNames) {
      const skill = skills.find((s) => s.name === skillName);
      if (skill) {
        await prisma.userSkill.upsert({
          where: { userId_skillId: { userId: user.id, skillId: skill.id } },
          update: {},
          create: {
            userId: user.id,
            skillId: skill.id,
            proficiencyLevel: Math.floor(Math.random() * 3) + 3, // 3-5 for assigned skills
          },
        });
      }
    }
  }
  console.log("✅ Assigned skills to users");

  // ═══ Posts — diverse, realistic MIT ADT content ═══
  const postData: {
    authorIndex: number;
    type: $Enums.PostType;
    title: string;
    content: string;
    isUrgent: boolean;
    tags: string[];
  }[] = [
    {
      authorIndex: 0,
      type: $Enums.PostType.RESOURCE,
      title: "Complete Next.js 15 + Prisma + Neon Setup Guide 🚀",
      content: "Hey MIT ADT fam! I've put together a comprehensive guide on setting up a modern full-stack app with Next.js 15, Prisma ORM, and Neon serverless PostgreSQL. Covers project scaffolding, database schema design, API routes with App Router, authentication with NextAuth.js, and deploying to Vercel. Includes a GitHub repo with starter template!\n\nPerfect for anyone starting their final year project or hackathon prep.",
      isUrgent: false,
      tags: ["Next.js", "Prisma", "PostgreSQL", "Full-Stack", "Guide"],
    },
    {
      authorIndex: 1,
      type: $Enums.PostType.HELP_REQUEST,
      title: "Training a YOLO model for campus parking detection — need GPU advice",
      content: "I'm working on my final year project — a real-time parking spot detection system for MIT ADT campus using YOLOv8. Model training on my laptop is painfully slow (GTX 1650). Has anyone used Google Colab Pro or the university's GPU cluster? What's the best way to get access? Also looking for anyone who has experience with custom YOLO dataset annotation.",
      isUrgent: true,
      tags: ["Machine Learning", "Computer Vision", "YOLO", "GPU", "Project"],
    },
    {
      authorIndex: 2,
      type: $Enums.PostType.RESOURCE,
      title: "Kaggle Competition Starter Kit — Data Science Club Edition 📊",
      content: "The MIT ADT Data Science Club has compiled a killer starter kit for Kaggle competitions! Includes:\n\n• EDA templates with pandas profiling\n• Feature engineering cookbook (50+ techniques)\n• Model stacking & ensemble methods\n• Hyperparameter tuning with Optuna\n• Submission pipeline automation\n\nAll notebooks tested on Google Colab. Sharing the GitHub link in comments. Join us every Saturday 4 PM in Lab 302!",
      isUrgent: false,
      tags: ["Data Science", "Kaggle", "Python", "Machine Learning", "Club"],
    },
    {
      authorIndex: 3,
      type: $Enums.PostType.HELP_REQUEST,
      title: "Docker Compose with Go microservices — health checks failing",
      content: "My docker-compose setup has 4 Go microservices + PostgreSQL + Redis. Health checks for the payment service keep failing even though the container starts fine. Using `curl` in healthcheck but Go service doesn't have curl installed. Should I switch to wget or a custom health endpoint? Anyone dealt with this in their projects? Config attached.",
      isUrgent: true,
      tags: ["Docker", "Go", "Microservices", "DevOps", "Help"],
    },
    {
      authorIndex: 4,
      type: $Enums.PostType.RESOURCE,
      title: "Free UI/UX Design Workshop Notes + Figma Templates ✨",
      content: "Sharing my detailed notes and Figma component library from the 2-day design workshop I conducted at MIT ADT last week. Covers:\n\n• Design thinking process\n• Color theory & typography pairing\n• Component-based design systems\n• Responsive layout patterns\n• 50+ reusable Figma components\n• Real-world case studies from Indian startups\n\nFigma community link in bio. Feel free to duplicate and use!",
      isUrgent: false,
      tags: ["UI/UX", "Figma", "Design", "Workshop", "Templates"],
    },
    {
      authorIndex: 5,
      type: $Enums.PostType.GENERAL,
      title: "Looking for teammates — Smart India Hackathon 2026 🏆",
      content: "SIH 2026 registrations are open! I'm forming a team from MIT ADT and need:\n\n• 1 ML/AI person (problem statement involves NLP)\n• 1 Frontend dev (React/Next.js)\n• 1 Flutter dev for mobile app\n\nWe're targeting the Ministry of Education problem statement on student learning analytics. Last year our team reached the grand finale. Let's do it again!\n\nDM me or comment below if interested. Deadline is next Friday!",
      isUrgent: false,
      tags: ["Hackathon", "SIH", "Team", "Collaboration", "Campus"],
    },
    {
      authorIndex: 6,
      type: $Enums.PostType.HELP_REQUEST,
      title: "Fine-tuning LLaMA 3 on custom dataset — CUDA out of memory",
      content: "Trying to fine-tune LLaMA 3 8B on a domain-specific dataset for my research project. Using LoRA with PEFT library but still getting CUDA OOM on the department's A100 (40GB). Batch size is already 1 with gradient accumulation. Has anyone tried QLoRA or other memory optimization techniques? Running on Python 3.11, PyTorch 2.3.",
      isUrgent: false,
      tags: ["Deep Learning", "LLM", "PyTorch", "Fine-tuning", "Research"],
    },
    {
      authorIndex: 7,
      type: $Enums.PostType.RESOURCE,
      title: "Flutter App Templates for MIT ADT Students 📱",
      content: "Built 5 Flutter starter templates optimized for college projects:\n\n1. Campus event tracker with Firebase\n2. Attendance management with QR codes\n3. Study group finder with real-time chat\n4. Library book tracker with barcode scanner\n5. Mess menu viewer with push notifications\n\nAll templates include Material 3 theming, dark mode, and are production-ready. Published on GitHub with MIT license. Fork and customize!",
      isUrgent: false,
      tags: ["Flutter", "Mobile", "Templates", "Firebase", "Open Source"],
    },
    {
      authorIndex: 8,
      type: $Enums.PostType.RESOURCE,
      title: "CTF Practice Guide — From Beginner to HackTheBox Pro 🔐",
      content: "Created a structured 12-week CTF preparation roadmap covering:\n\nWeek 1-3: Linux fundamentals, networking basics\nWeek 4-6: Web exploitation (XSS, SQLi, SSRF)\nWeek 7-9: Binary exploitation, reverse engineering\nWeek 10-12: Cryptography, forensics, real CTF competitions\n\nIncludes 200+ practice challenges with writeups, tool configurations, and a private Discord for MIT ADT cybersecurity enthusiasts. Join us!",
      isUrgent: false,
      tags: ["Cybersecurity", "CTF", "Ethical Hacking", "Guide", "Security"],
    },
    {
      authorIndex: 9,
      type: $Enums.PostType.HELP_REQUEST,
      title: "React useEffect cleanup — memory leak warning 😵",
      content: "I'm getting 'Can't perform a React state update on an unmounted component' warning in my project. Using useEffect to fetch data with async/await. I know I need a cleanup function but I'm confused about AbortController vs boolean flags. Can someone explain with a simple example? This is for my semester project.",
      isUrgent: false,
      tags: ["React", "JavaScript", "Hooks", "Help", "Beginner"],
    },
    {
      authorIndex: 10,
      type: $Enums.PostType.GENERAL,
      title: "Data Analytics Internship Experience at Persistent Systems — AMA! 💼",
      content: "Just completed my 6-month data analytics internship at Persistent Systems, Pune! Worked on customer churn prediction using XGBoost and built dashboards in Power BI. Happy to answer questions about:\n\n• Application process and interview prep\n• Day-to-day life at Persistent\n• Skills they value most\n• Remote vs in-office culture\n• Tips for MIT ADT students applying\n\nAsk me anything! PS: they're hiring interns for next semester.",
      isUrgent: false,
      tags: ["Internship", "Data Science", "AMA", "Career", "Pune"],
    },
    {
      authorIndex: 11,
      type: $Enums.PostType.RESOURCE,
      title: "Solidity Smart Contract Security Checklist ⛓️",
      content: "After getting rekt in a CTF challenge, I compiled a comprehensive Solidity security checklist:\n\n• Reentrancy guards (always use ReentrancyGuard)\n• Integer overflow checks (Solidity 0.8+ handles this)\n• Access control patterns (OpenZeppelin roles)\n• Gas optimization techniques\n• Common DeFi attack vectors\n• Testing with Foundry & Hardhat\n\nPDF with code examples shared on the MIT ADT Blockchain Club channel. Study before your next Web3 hackathon!",
      isUrgent: false,
      tags: ["Blockchain", "Solidity", "Security", "Web3", "Smart Contracts"],
    },
    {
      authorIndex: 0,
      type: $Enums.PostType.GENERAL,
      title: "Campus Hackathon — CodeStorm 2026 this Saturday! 🌩️",
      content: "MIT ADT's annual 24-hour hackathon is HERE! 🎉\n\n📅 This Saturday, 10 AM\n📍 Central Auditorium\n🏆 Prizes worth ₹2,00,000\n💻 Themes: EdTech, HealthTech, FinTech, Sustainability\n🍕 Free food, swag, and mentorship from industry experts\n\nRegistration still open — teams of 2-4. First-years especially welcome! This is the perfect opportunity to build, learn, and connect.\n\nRegister link in comments. See you there!",
      isUrgent: false,
      tags: ["Hackathon", "CodeStorm", "Campus", "Event", "MIT ADT"],
    },
    {
      authorIndex: 1,
      type: $Enums.PostType.RESOURCE,
      title: "Machine Learning Crash Course — Semester Exam Prep 📚",
      content: "Compiled all ML formulas, algorithms, and concepts for our semester exam in one place:\n\n• Linear/Logistic Regression derivations\n• SVM kernel trick explained simply\n• Decision Trees & Random Forest comparison\n• Neural Network backpropagation step-by-step\n• Bias-Variance tradeoff visualized\n• PCA & dimensionality reduction\n• Practice questions from last 5 years\n\nGoogle Drive link in comments. Good luck everyone! 🍀",
      isUrgent: false,
      tags: ["Machine Learning", "Exam Prep", "Notes", "AI", "Study Material"],
    },
    {
      authorIndex: 4,
      type: $Enums.PostType.HELP_REQUEST,
      title: "Responsive navbar breaking on mobile — Tailwind CSS v4",
      content: "Migrated my portfolio to Tailwind CSS v4 and the responsive navbar hamburger menu isn't working. The breakpoint classes changed from v3. Menu opens but doesn't close on link click. Using Next.js 15 with App Router. Can someone review my component? I think it's a state management issue with the sheet component.",
      isUrgent: false,
      tags: ["Tailwind CSS", "React", "Responsive", "Help", "Frontend"],
    },
    {
      authorIndex: 3,
      type: $Enums.PostType.GENERAL,
      title: "Competitive Programming weekly contest — join us! 💪",
      content: "Starting a weekly CP contest series at MIT ADT! Every Wednesday, 8 PM in Computer Lab 3.\n\n• 4 problems of increasing difficulty\n• Editorial discussion after\n• Top 3 scorers get T&P recommendation letters\n• Preparation for ICPC, CodeChef, and Codeforces\n\nAll skill levels welcome. We start from basics and build up. DM if you want to be added to the WhatsApp group!",
      isUrgent: false,
      tags: ["Competitive Programming", "CP", "ICPC", "CodeChef", "Study Group"],
    },
    {
      authorIndex: 2,
      type: $Enums.PostType.HELP_REQUEST,
      title: "Pandas DataFrame performance — 10M rows taking forever",
      content: "Processing a 10M row CSV for a data pipeline project. Using pandas but `.apply()` on a complex transformation is taking 45+ minutes. Tried vectorization for simple ops but this function has conditional logic. Should I switch to Polars, Dask, or just use PySpark? Running on 16GB RAM. Any MIT ADT data science folks dealt with big datasets?",
      isUrgent: true,
      tags: ["Python", "Pandas", "Data Science", "Performance", "Big Data"],
    },
    {
      authorIndex: 7,
      type: $Enums.PostType.GENERAL,
      title: "Published my first app on Play Store! 🎉",
      content: "After 3 months of building, my campus navigation app 'MIT ADT Navigator' is live on Google Play Store! Features:\n\n• Interactive campus map with building search\n• Class schedule with room locations\n• Navigation using AR overlays\n• Offline mode for areas with poor connectivity\n\nBuilt with Flutter + Google Maps SDK. Would love feedback from fellow students. Download link in comments!",
      isUrgent: false,
      tags: ["Flutter", "Mobile", "Launch", "Campus", "MIT ADT"],
    },
    {
      authorIndex: 8,
      type: $Enums.PostType.HELP_REQUEST,
      title: "Burp Suite proxy not intercepting HTTPS traffic",
      content: "Setting up Burp Suite for our web security lab assignment. HTTP interception works fine but HTTPS traffic goes through without being captured. Already imported the Burp CA certificate in the browser. Using Firefox on Ubuntu. Is there an additional step for HTTPS? Lab submission deadline is tomorrow!",
      isUrgent: true,
      tags: ["Cybersecurity", "Burp Suite", "HTTPS", "Lab", "Help"],
    },
    {
      authorIndex: 6,
      type: $Enums.PostType.RESOURCE,
      title: "Hugging Face Transformers — Beginner to Advanced Notebook Collection 🤗",
      content: "Created a collection of 15 Jupyter notebooks for getting started with Hugging Face Transformers:\n\n1. Text classification with BERT\n2. Named Entity Recognition\n3. Sentiment analysis pipeline\n4. Text summarization with T5\n5. Question answering\n6. Custom dataset fine-tuning\n7. Model deployment with Gradio\n...and 8 more!\n\nAll tested on free Colab tier. Perfect for AI course assignments and projects. GitHub repo has 50+ stars already!",
      isUrgent: false,
      tags: ["NLP", "Transformers", "Hugging Face", "Deep Learning", "Notebooks"],
    },
  ];

  const createdPosts = [];
  for (const post of postData) {
    const author = users[post.authorIndex];
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
    createdPosts.push(created);

    // Add random likes from other users
    const likeUsers = users
      .filter((u) => u.id !== author.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 6));
    for (const u of likeUsers) {
      await prisma.like.create({
        data: { userId: u.id, postId: created.id },
      });
    }
  }
  console.log(`✅ Created ${postData.length} posts with likes`);

  // ═══ Comments ═══
  const commentData = [
    { postIndex: 0, authorIndex: 1, content: "This is exactly what I needed for my final year project! The Neon serverless setup is smooth. Thanks Aryan! 🙌" },
    { postIndex: 0, authorIndex: 4, content: "Great guide! Would love to see a section on authentication with NextAuth.js v5 beta." },
    { postIndex: 0, authorIndex: 9, content: "Following this step by step. Works perfectly! First time using Prisma and it's amazing." },
    { postIndex: 1, authorIndex: 2, content: "I've used Colab Pro for similar YOLO training. Works well for small datasets. For larger ones, try Lambda Cloud — they have hourly A100 rentals." },
    { postIndex: 1, authorIndex: 6, content: "For dataset annotation, try CVAT or Label Studio. Both open-source and support YOLO format natively." },
    { postIndex: 2, authorIndex: 10, content: "These templates saved me hours in the last Kaggle competition! The feature engineering cookbook is gold. 🏅" },
    { postIndex: 3, authorIndex: 0, content: "Use a custom /healthz endpoint in your Go service that returns 200 OK. Docker healthcheck: `CMD [\"wget\", \"-qO-\", \"http://localhost:8080/healthz\"]`" },
    { postIndex: 3, authorIndex: 5, content: "Had the same issue! You need a tiny health check binary. Check grpc-health-probe for gRPC services." },
    { postIndex: 4, authorIndex: 10, content: "These Figma components are beautiful! Using them for my portfolio redesign. Thanks Priya! ✨" },
    { postIndex: 5, authorIndex: 0, content: "Count me in for frontend! I've been working with Next.js for 2 years now. DMing you!" },
    { postIndex: 5, authorIndex: 6, content: "I can handle the NLP part. Experienced with Hugging Face and spaCy. Let's connect!" },
    { postIndex: 5, authorIndex: 7, content: "I'd love to do the Flutter mobile app! Sending you a DM right now." },
    { postIndex: 6, authorIndex: 1, content: "Try 4-bit quantization with bitsandbytes. QLoRA + PEFT reduces memory to ~12GB for LLaMA 3 8B. Here's the config I use..." },
    { postIndex: 7, authorIndex: 9, content: "The attendance app with QR codes is exactly what our class needs! Forked and customizing it for our batch. 🎉" },
    { postIndex: 8, authorIndex: 3, content: "This roadmap is comprehensive! Would add PicoCTF as a great starting platform for complete beginners." },
    { postIndex: 9, authorIndex: 0, content: "Use AbortController! Here's the pattern:\n\n```\nuseEffect(() => {\n  const controller = new AbortController();\n  fetch(url, { signal: controller.signal })...\n  return () => controller.abort();\n}, []);\n```" },
    { postIndex: 9, authorIndex: 5, content: "Also check out the useSWR or TanStack Query hooks — they handle cleanup automatically and are much cleaner than raw useEffect." },
    { postIndex: 10, authorIndex: 2, content: "What tools did you use for the dashboards? Power BI or Tableau? And did you need SQL knowledge for the interviews?" },
    { postIndex: 12, authorIndex: 4, content: "Can't wait! Already forming a team with Sneha and Vedant. Going for the EdTech theme! 🚀" },
    { postIndex: 12, authorIndex: 9, content: "First hackathon, super excited! Can first-years join solo and find teams there?" },
    { postIndex: 12, authorIndex: 3, content: "Yes! We always have a team matching session at 10:30 AM before the start. Come with ideas!" },
    { postIndex: 15, authorIndex: 9, content: "This is amazing! Just joined the WhatsApp group. My first CP contest 🎯" },
    { postIndex: 15, authorIndex: 1, content: "Will the problems be in C++? Or can we use Python too?" },
    { postIndex: 15, authorIndex: 3, content: "Any language is fine! We accept C++, Python, Java, and Go. Pick whatever you're comfortable with." },
    { postIndex: 17, authorIndex: 4, content: "The AR navigation is so cool! Works perfectly in the CS building. Some rooms on the 3rd floor aren't mapped yet though." },
    { postIndex: 17, authorIndex: 0, content: "Congrats Aditya! 🎉 This is really impressive for a campus app. Would you be open to adding a bus schedule feature?" },
    { postIndex: 19, authorIndex: 1, content: "Starred the repo! The BERT classification notebook is exactly what I need for my NLP assignment. Thanks Ananya!" },
    { postIndex: 19, authorIndex: 2, content: "The Gradio deployment notebook is fantastic. Now I can demo my models to professors without setting up a server!" },
  ];

  for (const c of commentData) {
    await prisma.comment.create({
      data: {
        postId: createdPosts[c.postIndex].id,
        authorId: users[c.authorIndex].id,
        content: c.content,
      },
    });
  }
  console.log(`✅ Created ${commentData.length} comments`);

  // ═══ Saves ═══
  const savesData = [
    { userIndex: 0, postIndices: [2, 6, 8, 13] },
    { userIndex: 1, postIndices: [0, 2, 6, 19] },
    { userIndex: 2, postIndices: [0, 6, 13, 16] },
    { userIndex: 3, postIndices: [0, 7, 8, 11] },
    { userIndex: 4, postIndices: [0, 2, 7, 13] },
    { userIndex: 5, postIndices: [0, 2, 4, 8] },
    { userIndex: 9, postIndices: [0, 4, 7, 9] },
  ];

  for (const s of savesData) {
    for (const pi of s.postIndices) {
      await prisma.save.upsert({
        where: { userId_postId: { userId: users[s.userIndex].id, postId: createdPosts[pi].id } },
        update: {},
        create: { userId: users[s.userIndex].id, postId: createdPosts[pi].id },
      });
    }
  }
  console.log("✅ Created saves");

  // ═══ Follows — build a realistic social graph ═══
  const followData = [
    { follower: 0, following: [1, 2, 3, 4, 5, 6, 7, 8] },
    { follower: 1, following: [0, 2, 6, 8] },
    { follower: 2, following: [0, 1, 4, 10] },
    { follower: 3, following: [0, 5, 7, 11] },
    { follower: 4, following: [0, 5, 6, 9] },
    { follower: 5, following: [0, 3, 4, 6, 7] },
    { follower: 6, following: [0, 1, 2, 11] },
    { follower: 7, following: [0, 4, 5, 8] },
    { follower: 8, following: [0, 3, 7, 11] },
    { follower: 9, following: [0, 1, 4, 5, 7] },
    { follower: 10, following: [0, 2, 6] },
    { follower: 11, following: [0, 3, 8] },
  ];

  for (const f of followData) {
    for (const fi of f.following) {
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: users[f.follower].id,
            followingId: users[fi].id,
          },
        },
        update: {},
        create: {
          followerId: users[f.follower].id,
          followingId: users[fi].id,
        },
      });
    }
  }
  console.log("✅ Created follow relationships");

  // ═══ Study Groups ═══
  const studyGroupsData = [
    {
      title: "System Design Weekly Prep",
      description: "Weekly study group for system design interviews. We cover load balancing, caching, database sharding, microservices, and real-world architecture case studies.",
      topic: "System Design",
      creatorIndex: 3,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maxMembers: 15,
      memberIndices: [0, 1, 5],
    },
    {
      title: "ML Paper Reading Club",
      description: "We read and discuss one ML/AI research paper every week. Great for building research intuition and staying up-to-date with the field.",
      topic: "Machine Learning",
      creatorIndex: 1,
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxMembers: 20,
      memberIndices: [2, 6, 10],
    },
    {
      title: "DSA Grind — Placement Prep",
      description: "Daily DSA problem solving for placement season. Focus on arrays, trees, graphs, DP. Using LeetCode and GeeksforGeeks problems.",
      topic: "Data Structures & Algorithms",
      creatorIndex: 0,
      scheduledAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      maxMembers: 25,
      memberIndices: [3, 5, 7, 9],
    },
    {
      title: "Web3 & Blockchain Workshop",
      description: "Hands-on workshop building DApps with Solidity, Hardhat, and ethers.js. Perfect for beginners interested in Web3 development.",
      topic: "Blockchain",
      creatorIndex: 11,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxMembers: 12,
      memberIndices: [0, 3],
    },
  ];

  for (const sg of studyGroupsData) {
    await prisma.studyGroup.create({
      data: {
        title: sg.title,
        description: sg.description,
        topic: sg.topic,
        scheduledAt: sg.scheduledAt,
        maxMembers: sg.maxMembers,
        creatorId: users[sg.creatorIndex].id,
        members: {
          create: [
            { userId: users[sg.creatorIndex].id },
            ...sg.memberIndices.map((mi) => ({ userId: users[mi].id })),
          ],
        },
      },
    });
  }
  console.log("✅ Created study groups");

  // ═══ Notifications ═══
  const notifData = [
    { userIndex: 0, type: $Enums.NotificationType.FOLLOW, message: "Aarav Deshmukh started following you!", linkUrl: "/profile/aaravd" },
    { userIndex: 0, type: $Enums.NotificationType.LIKE, message: "Sneha Kulkarni liked your post 'Complete Next.js 15 + Prisma + Neon Setup Guide'", linkUrl: "/feed" },
    { userIndex: 0, type: $Enums.NotificationType.REPLY, message: "Priya Sharma commented on your post", linkUrl: "/feed" },
    { userIndex: 0, type: $Enums.NotificationType.SYSTEM, message: "Welcome to Clonnect! Complete your profile to get matched with peers.", linkUrl: "/profile/aryangulhane" },
    { userIndex: 0, type: $Enums.NotificationType.MATCH, message: "You and Vedant Joshi have 4 skills in common! Connect?", linkUrl: "/profile/vedantj" },
    { userIndex: 1, type: $Enums.NotificationType.FOLLOW, message: "Aryan Gulhane started following you!" },
    { userIndex: 1, type: $Enums.NotificationType.LIKE, message: "Ananya Bhosale liked your ML Crash Course post" },
    { userIndex: 2, type: $Enums.NotificationType.FOLLOW, message: "Tanvi Deshpande started following you!" },
    { userIndex: 2, type: $Enums.NotificationType.REPLY, message: "Tanvi Deshpande commented on your Kaggle Starter Kit" },
    { userIndex: 4, type: $Enums.NotificationType.LIKE, message: "Sahil Mane and 3 others liked your Design Workshop Notes" },
    { userIndex: 4, type: $Enums.NotificationType.FOLLOW, message: "Vedant Joshi started following you!" },
    { userIndex: 9, type: $Enums.NotificationType.SYSTEM, message: "Welcome to Clonnect! You're part of the MIT ADT community now 🎉" },
    { userIndex: 9, type: $Enums.NotificationType.FOLLOW, message: "Aryan Gulhane started following you!" },
  ];

  for (const n of notifData) {
    await prisma.notification.create({
      data: {
        userId: users[n.userIndex].id,
        type: n.type,
        message: n.message,
        linkUrl: n.linkUrl ?? null,
        isRead: false,
      },
    });
  }
  console.log("✅ Created notifications");

  // ═══ Badges ═══
  const badgesData = [
    { userIndex: 0, type: "early_adopter" },
    { userIndex: 0, type: "top_contributor" },
    { userIndex: 1, type: "ai_expert" },
    { userIndex: 1, type: "researcher" },
    { userIndex: 2, type: "data_wizard" },
    { userIndex: 4, type: "design_guru" },
    { userIndex: 7, type: "app_publisher" },
    { userIndex: 8, type: "security_hero" },
    { userIndex: 11, type: "web3_pioneer" },
  ];

  for (const b of badgesData) {
    await prisma.badge.create({
      data: {
        userId: users[b.userIndex].id,
        type: b.type,
      },
    });
  }
  console.log("✅ Created badges");

  console.log("\n🎉 Seeding complete! MIT ADT University data loaded successfully.");
  console.log(`   📊 ${users.length} users, ${postData.length} posts, ${commentData.length} comments`);
  console.log(`   🔗 Follow relationships, likes, saves, study groups, and notifications created`);
  console.log(`\n   Login with: any-email@clonnect.dev / password123`);
  console.log(`   Example: aryan@clonnect.dev / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
