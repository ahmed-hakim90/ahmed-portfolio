import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";

export const DATA = {
  name: "Ahmed Abdulhakim ",
  initials: "Hakimo",
  url: "https://portfolio-nine-gules-76.vercel.app/",
  location: "Helwan .cairo, Egypt",
  locationLink: "https://www.google.com/maps/place/cairo",
  description:
    "Software Engineer turned Entrepreneur. I love building things and helping people.",
  summary:
    " journey 5 years ago and worked on real-life project Founder My Own Business. One of my notable recent works was a countdown page for the Grand Egyptian Museum, delivered urgently during th\e Eid holiday, with full attention to detail and tight deadlines.Recently, I built my latest project using React.js + Vite, which reflects my current skills. Earlier projects were from the beginning of my journey, but they were essential foundations. I’m also passionate about entrepreneurship. I’ve previously launched my own business and now I'm back to the tech field — learning, growing, and working toward launching my own software company to power future projects. I value commitment, precision, and results — and I always strive to exceed expectations.",
  avatarUrl: "/me1.jpg",
  skills: [
    "React",
    "Git",
    "Bootstrap",
    "Postman",
    "Css",
    "Html",
    "Vue.js",
    "Tailwind CSS",
    "scss",
    "JavaScript",
    "jQuery",
    "flutter",
    "Responsive Design",
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
  ],
  contact: {
    email: "ahmedabdulhakim90@gmail.com",
    tel: "+201552900017",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/ahmed-hakim90",
        icon: Icons.github,

        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/ahmed-abdulhakim-sayed-471752174/",
        icon: Icons.linkedin,

        navbar: true,
      },
      X: {
        name: "X",
        url: "https://x.com/ahmed_hakim900",
        icon: Icons.x,

        navbar: true,
      },
      Youtube: {
        name: "Youtube",
        url: "x",
        icon: Icons.youtube,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "mailto:ahmedabdulhakim90@gmail.com",
        icon: Icons.email,

        navbar: true,
      },
    },
  },

  work: [
    {
      company: "Grand Egyptian Museum",
      href: "https://www.visit-gem.com/ar/home",
      badges: [],
      location: "Freelancer",
      title: "Frontend Developer",
      logoUrl: "https://www.visit-gem.com/assets/img/logo.png",
      start: "Jul 2025",
      end: "Jul 2025",
      description:
        "Implemented the Counter Down Page with custom animations and responsive design and 2 Languages .",
    },
    {
      company: "Mostaql",
      badges: [],
      href: "https://mostaql.com/",
      location: "Freelancer",
      title: "Frontend Developer",
      logoUrl: "https://mostaql.hsoubcdn.com/public/assets/images/custom/mostaql-logo-white.svg?id=dc639dfc13cb096309795e9d84ddd15c",
      start: "January 2018",
      end: "April 2023",
      description:
        "I'm a passionate web developer with 4 years of hands-on experience. I've worked on various real-world projects through platforms like Mostaql, delivering tailored digital solutions to diverse clients.",
    },

    {
      company: "ATHEEL Company",
      href: "https://atheelcc.com/",
      badges: [],
      location: "Maadi, Cairo",
      title: "Customer Service",
      logoUrl: "https://atheelcc.com/wp-content/uploads/2021/03/cropped-Asset-5hdpi-103x35.png",
      start: "January 2019",
      end: "April 2020",
      description:
        "I have experience in customer service, which helped me build strong communication skills, empathy, and a deep understanding of client needs. This background allows me to approach problems with a customer-first mindset — something I carry into my work as a developer.",
    },
  
    {
      company: "My Business",
      href: "",
      badges: [],
      location: "Helwan, cairo",
      title: "Founder",
      logoUrl: "",
      start: "March 2021",
      end: "Present",
      description:
        "I previously launched my own small business, where I handled everything from planning and operations to customer relations and sales. This experience gave me a strong foundation in entrepreneurship, problem-solving, and decision-making — skills that continue to shape the way I work and think today.",
    },
  ],
  education: [
    {
      school: "Technical Health Institute",
      href: "https://images.app.goo.gl/b8MG7usRRHU49qdu7",
      degree: "Associate Degree of Technical Health Insurance",
      logoUrl: "https://images.app.goo.gl/b8MG7usRRHU49qdu7",
      start: "2019",
      end: "2021",
    },
  ],
  projects: [
    {
      title: "Counter Down",
      href: "https://ahmed-hakim90.github.io/timer.github.io/",
      dates: "Jul 2025 -Jul 2025",
      active: true,
      description:
        "🚀 Delivered a countdown landing page for the Grand Egyptian Museum launch just 2 days before Eid, despite the holiday break. The task was requested urgently, and I managed to finalize and deliver it by the early hours of the third day of Eid, ahead of the (later postponed) opening. Client was in a rush, and I made it happen — even during the official holiday.",
      technologies: [
        "Html",
        "Css",
        "Responsive Design",
        "JavaScript",
      ],
      links: [
        {
          type: "Website",
          href: "https://ahmed-hakim90.github.io/timer.github.io/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/gem.png",
      video:
        "",
    },
    {
      title: "Khatwa",
      href: "https://ahmed-hakim90.github.io/khatwa/",
      dates: "June 2023 - Present",
      active: true,
      description:
        "🔧 I worked on 'Khotwa', a digital platform connecting freelancers with clients, with integrated Mada payment system. I contributed to the project from its early stages, starting 4 years ago. Today, the platform has evolved significantly, and due to client confidentiality, I can't showcase the full project — but it was a key experience in building real, scalable digital solutions.",
      technologies: [
        "Html",
        "Css",
        "Bootstrap",
        "Responsive Design",
        "JavaScript",
        "Jquery",
      ],
      links: [
        {
          type: "Website",
          href: "https://ahmed-hakim90.github.io/khatwa/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/ahmed-hakim90/khatwa",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/khatwa.png",
      video: "",
    },
    {
      title: "Personal Site",
      href: "https://ahmed-hakim90.github.io/Personal/",
      dates: "April 2023 - September 2023",
      active: true,
      description:
        "Developed this site to learn and practice writing code.",
      technologies: [
        "JavaScript",
        "jsx",
        "Dom",
        "Css",
        "Bootstrap",
        "Adobe XD",
        "HTML",
      ],
      links: [
        {
          type: "Website",
          href: "https://ahmed-hakim90.github.io/Personal/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://ahmed-hakim90.github.io/Personal/",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "/personal.png",
      video: "",
    },
    {
      title: "Berif for Business",
      href: "https://ahmed-hakim90.github.io/khalil.github.io/",
      active: true,
      description:
        "Developed an AI Customer Support Chatbot which automatically responds to customer support tickets using the latest GPT models.",
      technologies: [
        "HTML",
        "CSS",
        "Bootstrap",
      ],
      links: [
        {
          type: "Website",
          href: "https://ahmed-hakim90.github.io/khalil.github.io/",
          icon: <Icons.globe className="size-3" />,
        },
      ],
      image: "/khalil.png",
      video:
        "",
    },
  ],
  hackathons: [
  ]
} as const;
