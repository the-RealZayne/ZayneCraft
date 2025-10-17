
# Platform Of Things

My own personal site filled with bits of stuff that might help other people one day

www.rexchoppers.com

### Commands
Run:
```sh
docker run --rm -it \
  -v $(pwd):/srv/jekyll \
  -p 4000:4000 \
  jekyll/jekyll:4.2.2 \
  jekyll serve --watch --force_polling --host 0.0.0.0
```

Build:
```sh
docker run --rm -it \
  -v $(pwd):/srv/jekyll \
  jekyll/jekyll:4.2.2 \
  jekyll build
```

### Brain Dump
- Versioned queues
- RabbitMQ Integration
- excimer for Sentry on Elasticbeanstalk
