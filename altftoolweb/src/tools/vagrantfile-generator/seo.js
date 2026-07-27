const seo = {
  intro:
    "This generator builds a complete Vagrantfile using Vagrant's configuration version 2 schema — box, hostname, forwarded ports, private networking, synced folders, a VirtualBox provider block with memory and CPUs, and an optional shell or Ansible provisioner. Every input is validated before the file is produced: ports must fall in 1-65535, hostnames must satisfy RFC 1123, and static IPs are checked against VirtualBox's default 192.168.56.0/21 host-only range so vagrant up does not fail on first boot.",
  useCases: [
    "Spinning up a disposable Ubuntu 22.04 VM with port 8080 forwarded to test a web app in isolation",
    "Creating a reproducible dev environment with a synced ./src folder and an inline apt-get bootstrap script",
    "Generating a Vagrantfile that runs an existing Ansible playbook against a fresh VM for role testing",
  ],
  benefits: [
    ["Validated before you boot", "Port ranges, hostname rules, IP octets and memory bounds are checked so the file works first time."],
    ["VirtualBox range warning", "Flags static IPs outside 192.168.56.0/21, the default host-only range since VirtualBox 6.1.28."],
    ["Three provisioner styles", "Inline shell, shell script file, or an ansible provisioner block — generated with correct Ruby syntax."],
  ],
  faqs: [
    [
      "What is a Vagrantfile and what goes in it?",
      "A Vagrantfile is a Ruby file that describes a virtual machine: the base box, hostname, networks, synced folders, provider resources and provisioners, wrapped in Vagrant.configure(\"2\"). Vagrant reads it when you run vagrant up and builds the VM to match.",
    ],
    [
      "Why does my Vagrant private network IP fail with VirtualBox?",
      "Since VirtualBox 6.1.28, host-only networks are restricted to the 192.168.56.0/21 range by default, so an IP like 192.168.33.10 from older tutorials is rejected. Either pick an address between 192.168.56.1 and 192.168.63.254 or whitelist other ranges in /etc/vbox/networks.conf.",
    ],
    [
      "How do I forward a port in Vagrant?",
      "Add config.vm.network \"forwarded_port\", guest: 80, host: 8080 to the Vagrantfile, which maps localhost:8080 on your machine to port 80 in the VM. Host ports below 1024 require root privileges, and each host port can only be forwarded once across running VMs.",
    ],
    [
      "How much memory should I give a Vagrant VM?",
      "Set it in the provider block with vb.memory; 1024 MB boots most Linux server boxes, 2048 MB is comfortable for builds, and desktop or database workloads need more. The value is megabytes, and anything below about 512 MB will boot but struggle with package installs.",
    ],
  ],
};

export default seo;
