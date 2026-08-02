import React from "react";

export default function LaptopHack() {
  return (
    <div
      className="terminal h-full w-full bg-[#070D18] text-green-400 font-mono overflow-hidden"
      // Deliberately themed "hacker terminal" sub-component: fixed dark background
      // (matches the platform's own dark-navy page token) regardless of the site's
      // light/dark toggle, so the green terminal text stays legible and the
      // terminal aesthetic is preserved in both site themes. See master.md section 1
      // for the token system this intentionally opts out of.
    >
      <div className="flex flex-col p-5 h-full box-border">
        <div className="line mb-2 animate-typing overflow-hidden whitespace-nowrap border-r-2 border-green-400 w-0">
          Connecting to target laptop...
          <span className="inline-block w-2 h-5 bg-green-400 animate-blink ml-1"></span>
        </div>
        <div className="line mb-2 animate-typing delay-1s overflow-hidden whitespace-nowrap border-r-2 border-green-400 w-0">
          Bypassing firewall...
          <span className="inline-block w-2 h-5 bg-green-400 animate-blink ml-1"></span>
        </div>
        <div className="line mb-2 animate-typing delay-2s overflow-hidden whitespace-nowrap border-r-2 border-green-400 w-0">
          Injecting payload...
          <span className="inline-block w-2 h-5 bg-green-400 animate-blink ml-1"></span>
        </div>
        <div className="line mb-2 animate-typing delay-3s overflow-hidden whitespace-nowrap border-r-2 border-green-400 w-0">
          Access granted!
          <span className="inline-block w-2 h-5 bg-green-400 animate-blink ml-1"></span>
        </div>
        <div className="line mb-2 animate-typing delay-4s overflow-hidden whitespace-nowrap border-r-2 border-green-400 w-0">
          Retrieving files...
          <span className="inline-block w-2 h-5 bg-green-400 animate-blink ml-1"></span>
        </div>
        <div className="line mb-2 animate-typing delay-5s overflow-hidden whitespace-nowrap border-r-2 border-green-400 w-0">
          Decrypting data...
          <span className="inline-block w-2 h-5 bg-green-400 animate-blink ml-1"></span>
        </div>
        <div className="line mb-2 animate-typing delay-6s overflow-hidden whitespace-nowrap border-r-2 border-green-400 w-0">
          Download complete!
          <span className="inline-block w-2 h-5 bg-green-400 animate-blink ml-1"></span>
        </div>
        <div className="line mb-4 animate-typing delay-7s overflow-hidden whitespace-nowrap border-r-2 border-green-400 w-0">
          All systems operational
          <span className="inline-block w-2 h-5 bg-green-400 animate-blink ml-1"></span>
        </div>

        {/* Fixed dark panel (matches the platform's dark --surface-soft token) so the
            mock shell output stays legible in light mode too — same rationale as the
            outer terminal background above. */}
        <div className="mock-code bg-[#142033] p-4 rounded overflow-auto flex-grow">
          <pre className="text-sm">
{`root@laptop:~$ cat secret.txt
U2FsdGVkX19abc123def456ghijkl789mnop
root@laptop:~$ sudo hack_network --target=192.168.0.1
Accessing remote device...
Permission granted...
root@laptop:~$ ./run_exploit.sh
Payload executed successfully!
root@laptop:~$ cat passwords.txt
admin: 123456
user: password123
root@laptop:~$ exit`}
          </pre>
        </div>
      </div>

      <style>
        {`
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes blink {
          0%, 50%, 100% { background-color: #00ff00; }
          25%, 75% { background-color: transparent; }
        }

        .animate-typing {
          animation: typing 2s steps(40, end) forwards;
        }

        .delay-1s {
          animation-delay: 2s;
        }

        .delay-2s {
          animation-delay: 4s;
        }

        .delay-3s {
          animation-delay: 6s;
        }

        .delay-4s {
          animation-delay: 8s;
        }

        .delay-5s {
          animation-delay: 10s;
        }

        .delay-6s {
          animation-delay: 12s;
        }

        .delay-7s {
          animation-delay: 14s;
        }

        .animate-blink {
          animation: blink 1s infinite;
        }

        @media (max-width: 480px) {
          .terminal {
            padding: 15px;
          }

          .mock-code pre {
            font-size: 13px;
          }
        }
        `}
      </style>
    </div>
  );
}
