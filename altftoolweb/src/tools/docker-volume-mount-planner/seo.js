const seo = {
  title: "Docker Volume Mount Planner: -v, --mount",
  metaDescription:
    "Describe one bind, named volume or tmpfs mount and get all four syntaxes - -v, --mount, Compose short and long - with read-only and propagation.",
  steps: [
    "Choose a Mount type: Bind mount (host path), Named volume (Docker managed) or tmpfs (in-memory, Linux only).",
    "Fill Host path (source) or Volume name (blank = anonymous) and Container path (target), then set Bind propagation, SELinux relabel or tmpfs size (blank = Docker default) and tick Mount read-only inside the container.",
    "Four snippets are generated - docker run -v short flag, docker run --mount (explicit), Compose short syntax and Compose long syntax - alongside a Things to watch list; press Copy all.",
  ],
  intro:
    "The Docker Volume Mount Planner turns one mount description — bind, named volume or tmpfs — into the four syntaxes Docker actually accepts: the `-v` short flag, the explicit `--mount` flag, and Compose short and long syntax. It applies the rules from the Docker Engine storage documentation and the Compose file specification, including the daemon's volume-name pattern, the six bind-propagation modes with `rprivate` as the default, and the fact that SELinux `z`/`Z` relabelling works with `-v` but not with `--mount`. It is for developers writing Dockerfiles, run commands and compose.yaml who keep hitting the differences between the two flag styles.",
  useCases: [
    "Converting an existing `docker run -v` command into the `--mount` form required by Swarm services and preferred in modern docs",
    "Adding a Postgres data volume to compose.yaml and getting the matching top-level `volumes:` declaration alongside the service mount",
    "Mounting a secrets directory as an in-memory tmpfs with a 100m cap so nothing touches the host disk",
  ],
  benefits: [
    [
      "Catches the relative-path footgun",
      "`docker run -v ./src:/app` silently creates a volume named ./src — the planner flags that and tells you to use an absolute path or $(pwd).",
    ],
    [
      "Puts each option where it is legal",
      "read-only becomes `ro` in `-v`, `readonly` in `--mount` and `read_only: true` in Compose long syntax, and propagation only appears for bind mounts.",
    ],
    [
      "Compose long syntax included",
      "Bind propagation and tmpfs size have no short-syntax equivalent, so the long form is generated for you rather than looked up.",
    ],
  ],
  faqs: [
    [
      "What is the difference between -v and --mount in Docker?",
      "They do the same job, but `-v` packs everything into one colon-separated string while `--mount` uses explicit `key=value` pairs. The practical difference is error handling: with `-v`, a host path that does not exist is created as an empty directory, and a source that is not absolute is treated as a volume name — `--mount` errors instead. `--mount` is also the only form accepted by `docker service create`, while SELinux `z`/`Z` relabelling is only available with `-v` and Compose short syntax.",
    ],
    [
      "Should I use a bind mount or a named volume?",
      "Use a named volume for anything that must outlive the container — databases, upload stores — because Docker manages it, it is portable across hosts, and an empty named volume is pre-populated with whatever the image already had at that path. Use a bind mount when you need the host's own files, such as live source code in development or a config file you edit locally. A bind mount shadows the image content at that path instead of copying it.",
    ],
    [
      "How do I make a Docker volume read-only?",
      "Append `:ro` in `-v` syntax (`-v /srv/conf:/etc/app:ro`), add `readonly` in `--mount` syntax (`--mount type=bind,source=/srv/conf,target=/etc/app,readonly`), or set `read_only: true` in Compose long syntax. Read-only applies to the mount only — the rest of the container filesystem stays writable unless you also set the container-level `read_only` flag.",
    ],
    [
      "What does bind-propagation rshared do?",
      "It controls whether mounts created inside the bind propagate back to the host and vice versa. Docker's default is `rprivate`: nothing propagates in either direction. `rshared` propagates both ways, `rslave` propagates host to container only, and the non-r variants apply to the mount point alone rather than its submounts. Propagation applies to bind mounts on Linux only, and the source must already be a shared mount point on the host for `rshared` to work.",
    ],
  ],
};

export default seo;
