export type SeedEntry = {
  kind: "experience" | "project" | "education" | "skill";
  title: string;
  subtitle?: string;
  dateRange?: string;
  location?: string;
  bullets: string[];
  tags: string[];
};

export const MASTER_BANK: SeedEntry[] = [
  // === EXPERIENCES ===
  {
    kind: "experience",
    title: "Nokia",
    subtitle: "Software Engineer",
    dateRange: "May 2026 -- Present",
    location: "Toronto, Ontario",
    bullets: [
      "Reduced telecom acceptance testing time from \\textbf{two hours to two minutes} by engineering \\textbf{Python} automation playbooks for AT\\&T and T-Mobile cloud infrastructures across \\textbf{scalable, distributed Linux} network systems.",
      "Architected a \\textbf{zero-touch LLM generation pipeline} for telecom workflows, enforcing \\textbf{schema-pinned JSON guardrails} and deterministic exit sentinels to prevent AI hallucinations across complex \\textbf{Unix infrastructures}.",
      "Automated T-Mobile CloudHSS network health validations by deploying \\textbf{21+ Python playbooks} to monitor \\textbf{Kubernetes pod readiness} and enforce strict sentinel-based pass/fail logic, \\textbf{eliminating false positives}.",
      "Architected a \\textbf{four-tiered Python testing pipeline}, using dynamic Keycloak tokens and \\textbf{server-sent event streams} to parse \\textbf{in-memory AES logs} and optimize job execution for massive enterprise cloud platforms.",
    ],
    tags: [
      "python",
      "linux",
      "kubernetes",
      "automation",
      "testing",
      "telecom",
      "ci/cd",
      "cloud",
    ],
  },
  {
    kind: "experience",
    title: "EasyClips",
    subtitle: "Founder",
    dateRange: "February 2026 -- May 2026",
    location: "Kingston, Ontario",
    bullets: [
      "Identified a critical bottleneck in creator workflows and launched an automated video clipping platform, scaling to \\textbf{5,000+ active users} over \\textbf{4 months} and generating \\textbf{\\$600+ in MRR} through rapid product iterations",
      "Established an \\textbf{Enterprise Partnership with Mosaic (YC W25)} to handle core video infrastructure, focusing internal resources on product strategy, user-feedback loops, and high-velocity feature prioritization",
      "Engineered a scalable organic distribution funnel via short-form social media platforms (\\textbf{@easyclips\\_io}), amassing \\textbf{600K+ organic views} and driving high-converting user acquisition with zero direct marketing cost",
      "Directed our end-to-end product strategy by translating core user pain points into technical architectures, optimizing system performance, and continuously shipping updates to maintain a competitive market edge",
    ],
    tags: [
      "startup",
      "product",
      "video",
      "growth",
      "saas",
      "entrepreneurship",
    ],
  },
  {
    kind: "experience",
    title: "Qrush AI",
    subtitle: "Co-founder and CTO",
    dateRange: "September 2025 -- February 2026",
    location: "Kingston, Ontario",
    bullets: [
      "Architected a \\textbf{scalable serverless infrastructure} on AWS App Runner and Neon (Postgres), implementing \\textbf{Row-Level Security} to ensure strict data isolation and \\textbf{auto-scaling} to support potential viral traffic spikes",
      "Engineered an Agentic AI matchmaking engine by integrating \\textbf{AWS Bedrock LLMs}, utilizing \\textbf{Generative AI} to perform \\textbf{semantic analysis} on user profiles and automate matchmaking logistics to eliminate human intervention",
      "Developed a high-performance PWA using React, TypeScript, and \\textbf{TanStack Query}, implementing \\textbf{optimistic UI updates} to eliminate loading states and ensure a \\textbf{zero-latency} profile experience for mobile users",
      "Orchestrated \\textbf{20+ automation workflows} using \\textbf{n8n} and \\textbf{AWS SES} to manage user lifecycles, executing a viral organic content strategy that secured \\textbf{200+ verified beta signups} pre-launch with \\textbf{\\$0 marketing spend}",
    ],
    tags: [
      "aws",
      "react",
      "typescript",
      "ai",
      "serverless",
      "startup",
      "postgres",
      "n8n",
    ],
  },
  {
    kind: "experience",
    title: "Queen's Aerospace Design Team",
    subtitle: "Computer Vision Team Lead",
    dateRange: "August 2024 -- May 2025",
    location: "Kingston, Ontario",
    bullets: [
      "Engineered a \\textbf{closed-loop} vision landing system using \\textbf{OpenCV} and \\textbf{ROS2}, implementing \\textbf{active stabilization} and \\textbf{PID control} to achieve \\textbf{10cm precision} during water collection, even under \\textbf{high wind disturbances}",
      "Designed and deployed a \\textbf{YOLOv8 + ROS2} computer vision pipeline on a fixed-wing UAV to autonomously detect wildfire targets, achieving \\textbf{85\\% detection accuracy} under varying flight conditions in system simulations",
      "\\textbf{Mentored 15+ engineers} on Python, ROS2, and Linux workflows, reducing new member onboarding time by \\textbf{50\\% (4 weeks to 2 weeks)} through the creation of structured training documentation and hands-on workshops",
      "Led perception development for \\textbf{2 competitive UAVs}, integrating software subsystems with custom hardware architectures to ensure reliable autonomous navigation and wildfire mapping for the AEAC competition",
    ],
    tags: [
      "opencv",
      "ros2",
      "yolov8",
      "uav",
      "python",
      "computer-vision",
      "pid",
      "slam",
      "c++",
      "sensor-integration",
      "linux",
    ],
  },
  {
    kind: "experience",
    title: "Supply Chain Illuminations",
    subtitle: "Full-Stack Developer",
    dateRange: "July 2024 -- September 2024",
    location: "Remote, USA",
    bullets: [
      "Modernized the ASSURIoT platform by upgrading legacy Angular components, implementing \\textbf{lazy loading} and \\textbf{code-splitting} to optimize large bundle sizes and accelerate dashboard rendering speeds for \\textbf{enterprise clients}",
      "Engineered interactive data visualization dashboards using Angular and \\textbf{REST APIs}, transforming raw telemetry into actionable insights to enable \\textbf{real-time operational monitoring} capabilities for administrative users",
      "Refactored the codebase to enforce \\textbf{strict TypeScript} typing and reusable patterns, eliminating runtime errors and standardizing API integration workflows to accelerate feature delivery for the engineering team",
    ],
    tags: [
      "angular",
      "typescript",
      "rest-api",
      "iot",
      "telemetry",
      "full-stack",
      "code-review",
    ],
  },

  // === PROJECTS ===
  {
    kind: "project",
    title: "EasyClips",
    subtitle: "\\href{https://github.com/KeshavM05/EasyClips}{Link}",
    dateRange: "February 2026 -- May 2026",
    bullets: [
      "Identified a critical bottleneck in creator workflows and launched an automated video clipping platform, scaling to \\textbf{5,000+ active users} over \\textbf{4 months} and generating \\textbf{\\$600+ in MRR} through rapid product iterations",
      "Established an \\textbf{Enterprise Partnership with Mosaic (YC W25)} to handle core video infrastructure, focusing internal resources on product strategy, user-feedback loops, and high-velocity feature prioritization",
      "Engineered a scalable organic distribution funnel via short-form social media platforms (\\textbf{@easyclips\\_io}), amassing \\textbf{600K+ organic views} and driving high-converting user acquisition with zero direct marketing cost",
      "Directed our end-to-end product strategy by translating core user pain points into technical architectures, optimizing system performance, and continuously shipping updates to maintain a competitive market edge",
    ],
    tags: ["startup", "product", "video", "growth"],
  },
  {
    kind: "project",
    title: "Qrush AI",
    subtitle: "TypeScript, React, AWS, PostgreSQL, n8n",
    dateRange: "September 2025 -- February 2026",
    bullets: [
      "Architected a \\textbf{scalable serverless infrastructure} on AWS App Runner and Neon (Postgres), implementing \\textbf{Row-Level Security} to ensure strict data isolation and \\textbf{auto-scaling} to support potential viral traffic spikes",
      "Engineered an Agentic AI matchmaking engine by integrating \\textbf{AWS Bedrock LLMs}, utilizing \\textbf{Generative AI} to perform \\textbf{semantic analysis} on user profiles and automate matchmaking logistics to eliminate human intervention",
      "Developed a high-performance PWA using React, TypeScript, and \\textbf{TanStack Query}, implementing \\textbf{optimistic UI updates} to eliminate loading states and ensure a \\textbf{zero-latency} profile experience for mobile users",
      "Orchestrated \\textbf{20+ automation workflows} using \\textbf{n8n} and \\textbf{AWS SES} to manage user lifecycles, executing a viral organic content strategy that secured \\textbf{200+ verified beta signups} pre-launch with \\textbf{\\$0 marketing spend}",
    ],
    tags: ["aws", "react", "typescript", "ai", "serverless", "postgres"],
  },
  {
    kind: "project",
    title: "Autonomous Delivery Robot",
    subtitle: "ROS2, Nav2, SLAM, C++, Python, Raspberry Pi",
    dateRange: "January 2025 -- April 2025",
    bullets: [
      "Developed \\textbf{low-level firmware (C++)} on Arduino for \\textbf{high-torque motor control} and encoder-based odometry; established a \\textbf{UART serial bridge} to stream real-time kinematic data to a \\textbf{ROS2} navigation stack",
      "Architected a navigation stack on Raspberry Pi 4 using \\textbf{ROS2} and \\textbf{Nav2}, implementing \\textbf{LiDAR-based SLAM} to generate precision indoor maps and enable \\textbf{autonomous path planning} with dynamic obstacle avoidance",
      "Engineered an end-to-end delivery workflow from dispatch to return-to-base logic, integrating high-level autonomy with low-level actuation to demonstrate \\textbf{reliable autonomous transport} of items within a university facility",
    ],
    tags: [
      "ros2",
      "c++",
      "slam",
      "nav2",
      "raspberry-pi",
      "arduino",
      "robotics",
      "lidar",
      "uart",
    ],
  },
  {
    kind: "project",
    title: "Queen's Aerospace Design Team",
    subtitle: "Python, OpenCV, ROS2, YOLOv8, Linux",
    dateRange: "August 2024 -- May 2025",
    bullets: [
      "Engineered a \\textbf{closed-loop} vision landing system using \\textbf{OpenCV} and \\textbf{ROS2}, implementing \\textbf{active stabilization} and \\textbf{PID control} to achieve \\textbf{10cm precision} during water collection, even under \\textbf{high wind disturbances}",
      "Designed and deployed a \\textbf{YOLOv8 + ROS2} computer vision pipeline on a fixed-wing UAV to autonomously detect wildfire targets, achieving \\textbf{85\\% detection accuracy} under varying flight conditions in system simulations",
      "\\textbf{Mentored 15+ engineers} on Python, ROS2, and Linux workflows, reducing new member onboarding time by \\textbf{50\\% (4 weeks to 2 weeks)} through the creation of structured training documentation and hands-on workshops",
      "Led perception development for \\textbf{2 competitive UAVs}, integrating software subsystems with custom hardware architectures to ensure reliable autonomous navigation and wildfire mapping for the AEAC competition",
    ],
    tags: [
      "opencv",
      "ros2",
      "yolov8",
      "uav",
      "python",
      "computer-vision",
      "linux",
    ],
  },
];

export const EDUCATION_TEX = `  \\resumeSubHeadingListStart
    \\resumeSubheading
  {Queen's University}{Kingston, Ontario}
  {Bachelor of Applied Science, Mechatronics \\& Robotics Engineering}{}
  \\resumeItemListStart
    \\resumeItem{\\textbf{Y Combinator AI Startup School (Summer 2025)}: Hand-picked as one of \\textbf{2,500 top technical students} globally to attend YC's inaugural AI summit in San Francisco}
  \\resumeItemListEnd
  \\resumeSubHeadingListEnd`;

export const SKILLS_TEX = `\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
\\textbf{Languages}{: Python, C++, C, TypeScript, JavaScript, SQL (PostgreSQL), Bash, MATLAB, Assembly, Java} \\\\
\\textbf{AI \\& Robotics}{: ROS2, Nav2, YOLOv8, OpenCV, TensorFlow, NumPy, PX4 Autopilot, Gazebo, PID Control, SLAM} \\\\
\\textbf{Full-Stack}{: React Native, React.js, Angular, Express.js, Node.js, TanStack Query, Drizzle ORM, Supabase, FastAPI} \\\\
\\textbf{Cloud \\& DevOps}{: AWS (EC2, RDS, App Runner, Bedrock, SES), Docker, Git, CI/CD, Linux (Ubuntu/WSL), n8n} \\\\
\\textbf{Hardware}{: NVIDIA Jetson, Raspberry Pi, Arduino, LiDAR, SolidWorks (CAD), I2C/SPI/UART, LTSpice} \\\\
}}
 \\end{itemize}`;
