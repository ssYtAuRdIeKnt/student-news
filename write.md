Task 1

I put integration-test after backend-test and before package. If unit tests fail there is no point starting a database, and images should not be built for code that fails its tests. package did not run because its needs line lists integration-test. In my PR this job failed after 26 seconds, while Playwright took 5 minutes to catch the same break.

A services block is started by the runner before the steps and is set up in the YAML. Testcontainers is a library, so the test starts PostgreSQL itself and gets the connection details at run time. No services block is needed because the ubuntu-latest runner already has Docker.

Task 2

Maven: Run unit tests took 27 s cold and 13 s warm, saving 14 s. npm: Install dependencies took 2 s cold and 1 s warm, saving 1 s. The cold run shows as cancelled because I amended the commit and the new push cancelled its last job, but the steps I measured had finished. The warm figures come from that next run, not the Re-run button. The dependency files did not change.

The Maven key is built from the OS, architecture and a hash of pom.xml. The npm key is built the same way from package-lock.json. If the key never changed, new dependencies would never be saved, so every run would download them again. With fail-fast: false, the Node 22 job was not cancelled when Node 20 failed, and it passed.

Task 3

Skipping E2E would be wrong if a Markdown file were actually used by the app or its tests. I would guard against that with a nightly E2E run on main that ignores the path filter.

Task 4

ci-status gives the rule one check name that does not change when jobs are added or renamed. It always runs and fails if any job failed or was cancelled.

Write-up

The pipeline now sits at Continuous Integration. Every change is built, unit tested, integration tested and packaged, and branch protection stops a red pull request from merging. It is not yet Continuous Delivery, because the images are built and thrown away: `package` has `push: false`, and `deploy.yml` only prints what would happen.

Reaching Continuous Delivery needs four things to become real. First, pushing images to a registry, tagged by commit SHA. This brings registry credentials into CI, so a leaked secret could publish a malicious image. Second, the "Confirm CI passed" step must really query that commit's result; a bug there lets untested code through. Third, a real deployment needs cluster credentials, and a bad release now affects real users. Fourth, health checks and automatic rollback must work. Rollback is risky because Flyway migrations do not roll back with the image. The manual trigger and environment reviewers would stay as the human approval.

Continuous Deployment would then remove the manual `workflow_dispatch` trigger, so every green commit reaches production without human review. The risk is largest here: E2E runs separately from CI, is not required and is skipped by path filters, so it must become a gate first.
