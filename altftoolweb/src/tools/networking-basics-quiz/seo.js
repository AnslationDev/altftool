const seo = {
  title: "Networking Quiz: 15 Questions on OSI, TCP/IP, DNS",
  steps: [
    "Read the first of 15 questions — What does TCP stand for? — and tap one of the four answers.",
    "The right answer turns green and a wrong one turns red straight away; press Next Question to move on.",
    "After the fifteenth question press See Results for a score out of 15 with the matching percentage, then Try Again to start over.",
  ],
  intro:
    "The Networking Basics Quiz is a 15-question multiple-choice test on computer networking fundamentals, covering the OSI model, TCP/IP, well-known port numbers, DNS and DHCP, MAC addressing, IPv4 address classes, subnet masks, network topologies and firewalls. Each question has four options, marks your answer right or wrong the moment you pick it, and the run ends with a score out of 15 and a percentage. It suits students revising for a first networking module, candidates warming up for CompTIA Network+ or CCNA study, and anyone about to be asked networking questions in an interview.",
  useCases: [
    "You have a networking exam on Monday and want to find out in five minutes whether you actually remember which OSI layer does routing before you decide what to revise.",
    "You are interviewing for a junior sysadmin or support role and want to check you will not stumble on port numbers or what DHCP does.",
    "You are teaching an intro networking class and want a quick warm-up your students can run before the lesson on subnetting.",
  ],
  benefits: [
    [
      "Marks each answer immediately",
      "You see whether you were right before moving on, so a wrong guess is corrected while the question is still in your head.",
    ],
    [
      "Spreads across the whole syllabus",
      "The 15 questions deliberately span protocols, the OSI model, devices, addressing and security rather than drilling one topic.",
    ],
    [
      "Ends with a percentage, not just a tick count",
      "The final screen gives your score out of 15 and the equivalent percentage, so you can compare runs as you revise.",
    ],
  ],
  faqs: [
    [
      "How many questions are in the networking quiz?",
      "15, each with four options and one correct answer. You work through them in order and get a score out of 15 plus a percentage at the end, then you can reset and run it again.",
    ],
    [
      "Which OSI layer handles routing?",
      "The Network layer, layer 3 — this is where routers make forwarding decisions using IP addresses. The Data Link layer below it deals in MAC addresses within a single network segment, which is the distinction the quiz tests.",
    ],
    [
      "What are the default ports the quiz asks about?",
      "HTTP runs on port 80 and HTTPS on port 443; the quiz also covers FTP on 21 and SMTP for sending email. These are the ports most commonly asked for in entry-level networking exams and interviews.",
    ],
    [
      "What is the Class A IPv4 address range?",
      "1.0.0.0 to 126.255.255.255. Class B runs from 128.0.0.0 to 191.255.255.255 and Class C from 192.0.0.0 to 223.255.255.255, with 127.x.x.x reserved for loopback — which is why Class A stops at 126.",
    ],
  ],
};

export default seo;
