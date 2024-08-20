window.BENCHMARK_DATA = {
  "lastUpdate": 1724123909223,
  "repoUrl": "https://github.com/johnhomantaring/cactus",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "peter.somogyvari@accenture.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "4a9ed0aecae84afb19c1a52b2de3cca35fa1a3de",
          "message": "build: add OpenAPI spec bundling, stop using URL references\n\n**IMPORTANT:** From now on, if you are changing the OpenAPI specification of any given\npackage within Cacti, please make sure to edit the template file instead of editing the\nopenapi.json specific file directly because changes in the openapi.json file will be\noverwritten by the codegen script the next time you run it.\nThis slight alteration in the development flow is the least intrusive solution I could find\nto resolving our issues with the release automation.\n\nThis change enables us to have our openapi.json files work without having remote and URL\nreferences in them (which was a blocker issue for release automation).\n\n1. The openapi.json files that we used to have are now called openapi.tpl.json where the\ntpl stands for template. Their content is equivalent to what openapi.json files used to\nhave prior to this commit.\n2. These template specs are fed into the bundler tool which then spits out the files which\nthen are saved as openapi.json files. The big change is that these bundled versions are\nno longer containing any remote nor URL references, only local ones.\n3. This means that we still get project-wide re-use of schema types from packages such as\ncactus-core-api, but we no longer suffer from the additional complexities of having to deal\nwith remote and URL references.\n4. The scirpt that performs the bundling is callable separately by executing this command\n```sh\nyarn tools:bundle-open-api-tpl-files\n```\n5. The `yarn tools:bundle-open-api-tpl-files` is also embedded as a warmup step of the\nlarger `codegen` script so there is no need usually to call the bundling script separately.\n6. The heavylifting in terms of bundling is done by the tooling script that can be found\nhere: `tools/bundle-open-api-tpl-files.ts`. On a high level what it does is loop through\nexisting `openapi.tpl.json` files throughout the project and then renders their bundled\nversion next to it as `openapi.json` which then can be used by all of our tools as a self\ncontained version of the template file which *does* still have the remote and URL references\nin it.\n\nMore information on what URL and remote references are can be read here on the official\nOpenAPI website: https://swagger.io/docs/specification/using-ref/\n\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-06-13T14:33:28-07:00",
          "tree_id": "c843189a368387d67b759d8ab5d97edebaf04ee8",
          "url": "https://github.com/johnhomantaring/cactus/commit/4a9ed0aecae84afb19c1a52b2de3cca35fa1a3de"
        },
        "date": 1718354054842,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "cmd-api-server_HTTP_GET_getOpenApiSpecV1",
            "value": 573,
            "range": "±1.63%",
            "unit": "ops/sec",
            "extra": "177 samples"
          },
          {
            "name": "cmd-api-server_gRPC_GetOpenApiSpecV1",
            "value": 349,
            "range": "±1.38%",
            "unit": "ops/sec",
            "extra": "181 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "peter.somogyvari@accenture.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "4a9ed0aecae84afb19c1a52b2de3cca35fa1a3de",
          "message": "build: add OpenAPI spec bundling, stop using URL references\n\n**IMPORTANT:** From now on, if you are changing the OpenAPI specification of any given\npackage within Cacti, please make sure to edit the template file instead of editing the\nopenapi.json specific file directly because changes in the openapi.json file will be\noverwritten by the codegen script the next time you run it.\nThis slight alteration in the development flow is the least intrusive solution I could find\nto resolving our issues with the release automation.\n\nThis change enables us to have our openapi.json files work without having remote and URL\nreferences in them (which was a blocker issue for release automation).\n\n1. The openapi.json files that we used to have are now called openapi.tpl.json where the\ntpl stands for template. Their content is equivalent to what openapi.json files used to\nhave prior to this commit.\n2. These template specs are fed into the bundler tool which then spits out the files which\nthen are saved as openapi.json files. The big change is that these bundled versions are\nno longer containing any remote nor URL references, only local ones.\n3. This means that we still get project-wide re-use of schema types from packages such as\ncactus-core-api, but we no longer suffer from the additional complexities of having to deal\nwith remote and URL references.\n4. The scirpt that performs the bundling is callable separately by executing this command\n```sh\nyarn tools:bundle-open-api-tpl-files\n```\n5. The `yarn tools:bundle-open-api-tpl-files` is also embedded as a warmup step of the\nlarger `codegen` script so there is no need usually to call the bundling script separately.\n6. The heavylifting in terms of bundling is done by the tooling script that can be found\nhere: `tools/bundle-open-api-tpl-files.ts`. On a high level what it does is loop through\nexisting `openapi.tpl.json` files throughout the project and then renders their bundled\nversion next to it as `openapi.json` which then can be used by all of our tools as a self\ncontained version of the template file which *does* still have the remote and URL references\nin it.\n\nMore information on what URL and remote references are can be read here on the official\nOpenAPI website: https://swagger.io/docs/specification/using-ref/\n\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-06-13T14:33:28-07:00",
          "tree_id": "c843189a368387d67b759d8ab5d97edebaf04ee8",
          "url": "https://github.com/johnhomantaring/cactus/commit/4a9ed0aecae84afb19c1a52b2de3cca35fa1a3de"
        },
        "date": 1718355024492,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "plugin-ledger-connector-besu_HTTP_GET_getOpenApiSpecV1",
            "value": 738,
            "range": "±2.77%",
            "unit": "ops/sec",
            "extra": "180 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "peter.somogyvari@accenture.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "5d7ec2985d2d0aed10c5f0915c6081c755bc99a7",
          "message": "ci(connector-corda): fix insufficient disk space errors\n\nWe have the disk clean-up in the CI off by default because it takes a few\nminutes to perform and most jobs don't need it, but for Corda it seems\nnecessary because our tests started failing with the message below\n(lines wrapped to make sure we don't run over the 100 character limit\nfor the git commit message)\n\ncactus-corda-4-8-all-in-one-flowdb:2024-07-08-hotfix-1]\n[WARN] 09:48:28+0000 [Thread-2\n(ActiveMQ-server-org.apache.activemq.artemis.core.server.impl.ActiveMQServerImpl$6@11a43807)]\ncore.server. -\nAMQ222210: Free storage space is at 145.7MB of 77.9GB total. Usage rate is 99.8% which is\nbeyond the configured <max-disk-usage>. System will start blocking producers.\n\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-07-11T21:54:20-07:00",
          "tree_id": "76f975422b6bbe5c840bd589b87f9afe373f5b19",
          "url": "https://github.com/johnhomantaring/cactus/commit/5d7ec2985d2d0aed10c5f0915c6081c755bc99a7"
        },
        "date": 1720772489790,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "cmd-api-server_HTTP_GET_getOpenApiSpecV1",
            "value": 580,
            "range": "±1.80%",
            "unit": "ops/sec",
            "extra": "178 samples"
          },
          {
            "name": "cmd-api-server_gRPC_GetOpenApiSpecV1",
            "value": 354,
            "range": "±1.45%",
            "unit": "ops/sec",
            "extra": "180 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "603ff0ea5b6243d8f1adf43e264d0524fa31c454",
          "message": "build: bump curve25519-dalek\n\nBumps the cargo group with 1 update in the\n/packages/cacti-plugin-ledger-connector-stellar/src/test/rust/demo-contract\ndirectory: [curve25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek).\n\nUpdates `curve25519-dalek` from 4.1.1 to 4.1.2\n- [Release notes](https://github.com/dalek-cryptography/curve25519-dalek/releases)\n- Commits:\nhttps://github.com/dalek-cryptography/curve25519-dalek/compare/curve25519-4.1.1...curve25519-4.1.2\n\n---\nupdated-dependencies:\n- dependency-name: curve25519-dalek\n  dependency-type: indirect\n  dependency-group: cargo\n...\n\nCo-authored-by: Peter Somogyvari <peter.somogyvari@accenture.com>\n\nSigned-off-by: dependabot[bot] <support@github.com>\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-07-19T14:21:03-07:00",
          "tree_id": "3b2280f1255fb5e886c8672b7dc9d151ae16d54e",
          "url": "https://github.com/johnhomantaring/cactus/commit/603ff0ea5b6243d8f1adf43e264d0524fa31c454"
        },
        "date": 1721704899385,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "cmd-api-server_HTTP_GET_getOpenApiSpecV1",
            "value": 575,
            "range": "±1.54%",
            "unit": "ops/sec",
            "extra": "178 samples"
          },
          {
            "name": "cmd-api-server_gRPC_GetOpenApiSpecV1",
            "value": 357,
            "range": "±1.44%",
            "unit": "ops/sec",
            "extra": "181 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "603ff0ea5b6243d8f1adf43e264d0524fa31c454",
          "message": "build: bump curve25519-dalek\n\nBumps the cargo group with 1 update in the\n/packages/cacti-plugin-ledger-connector-stellar/src/test/rust/demo-contract\ndirectory: [curve25519-dalek](https://github.com/dalek-cryptography/curve25519-dalek).\n\nUpdates `curve25519-dalek` from 4.1.1 to 4.1.2\n- [Release notes](https://github.com/dalek-cryptography/curve25519-dalek/releases)\n- Commits:\nhttps://github.com/dalek-cryptography/curve25519-dalek/compare/curve25519-4.1.1...curve25519-4.1.2\n\n---\nupdated-dependencies:\n- dependency-name: curve25519-dalek\n  dependency-type: indirect\n  dependency-group: cargo\n...\n\nCo-authored-by: Peter Somogyvari <peter.somogyvari@accenture.com>\n\nSigned-off-by: dependabot[bot] <support@github.com>\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-07-19T14:21:03-07:00",
          "tree_id": "3b2280f1255fb5e886c8672b7dc9d151ae16d54e",
          "url": "https://github.com/johnhomantaring/cactus/commit/603ff0ea5b6243d8f1adf43e264d0524fa31c454"
        },
        "date": 1721705671309,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "plugin-ledger-connector-besu_HTTP_GET_getOpenApiSpecV1",
            "value": 728,
            "range": "±2.99%",
            "unit": "ops/sec",
            "extra": "180 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "9698f79e1eff7375e8270f2f8584a2cc75491568",
          "message": "build: bump time\n\nBumps [time](https://github.com/time-rs/time) from 0.3.31 to 0.3.36.\n- [Release notes](https://github.com/time-rs/time/releases)\n- [Changelog](https://github.com/time-rs/time/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/time-rs/time/compare/v0.3.31...v0.3.36)\n\n---\nupdated-dependencies:\n- dependency-name: time\n  dependency-type: indirect\n...\n\nCo-authored-by: Peter Somogyvari <peter.somogyvari@accenture.com>\n\nSigned-off-by: dependabot[bot] <support@github.com>\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-07-31T16:20:56-07:00",
          "tree_id": "5c549184e1268dd945dae2ad11bec61c6182df3d",
          "url": "https://github.com/johnhomantaring/cactus/commit/9698f79e1eff7375e8270f2f8584a2cc75491568"
        },
        "date": 1722495956302,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "cmd-api-server_HTTP_GET_getOpenApiSpecV1",
            "value": 591,
            "range": "±1.67%",
            "unit": "ops/sec",
            "extra": "177 samples"
          },
          {
            "name": "cmd-api-server_gRPC_GetOpenApiSpecV1",
            "value": 356,
            "range": "±1.42%",
            "unit": "ops/sec",
            "extra": "179 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "peter.somogyvari@accenture.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "committer": {
            "email": "sandeepn.official@gmail.com",
            "name": "Sandeep Nishad",
            "username": "sandeepnRES"
          },
          "distinct": true,
          "id": "d0e4539a9b106fa684cd34a6cdb1ff835b870ce4",
          "message": "ci(github): upgrade actions/github-script to 7.0.1 project-wide\n\nFixes #3458\n\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-08-09T05:57:27+05:30",
          "tree_id": "1b12638b0ee30d8845ca2446fe5a82b172922a85",
          "url": "https://github.com/johnhomantaring/cactus/commit/d0e4539a9b106fa684cd34a6cdb1ff835b870ce4"
        },
        "date": 1723395730606,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "cmd-api-server_HTTP_GET_getOpenApiSpecV1",
            "value": 589,
            "range": "±1.70%",
            "unit": "ops/sec",
            "extra": "176 samples"
          },
          {
            "name": "cmd-api-server_gRPC_GetOpenApiSpecV1",
            "value": 346,
            "range": "±1.93%",
            "unit": "ops/sec",
            "extra": "181 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "peter.somogyvari@accenture.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "committer": {
            "email": "sandeepn.official@gmail.com",
            "name": "Sandeep Nishad",
            "username": "sandeepnRES"
          },
          "distinct": true,
          "id": "d0e4539a9b106fa684cd34a6cdb1ff835b870ce4",
          "message": "ci(github): upgrade actions/github-script to 7.0.1 project-wide\n\nFixes #3458\n\nSigned-off-by: Peter Somogyvari <peter.somogyvari@accenture.com>",
          "timestamp": "2024-08-09T05:57:27+05:30",
          "tree_id": "1b12638b0ee30d8845ca2446fe5a82b172922a85",
          "url": "https://github.com/johnhomantaring/cactus/commit/d0e4539a9b106fa684cd34a6cdb1ff835b870ce4"
        },
        "date": 1723396775402,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "plugin-ledger-connector-besu_HTTP_GET_getOpenApiSpecV1",
            "value": 727,
            "range": "±2.73%",
            "unit": "ops/sec",
            "extra": "180 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "adrian.batuto@accenture.com",
            "name": "adrianbatuto",
            "username": "adrianbatuto"
          },
          "committer": {
            "email": "petermetz@users.noreply.github.com",
            "name": "Peter Somogyvari",
            "username": "petermetz"
          },
          "distinct": true,
          "id": "ec9683d38670fe5d657b602db8215e602fd4209d",
          "message": "feat(corda): support 5.1 via TS/HTTP (no JVM)\nFixes #2978\nFixes #3293\n\nSigned-off-by: adrianbatuto <adrian.batuto@accenture.com>",
          "timestamp": "2024-08-19T14:43:10-07:00",
          "tree_id": "530c66f1928ba9481fcc2d1d760582bf58be6677",
          "url": "https://github.com/johnhomantaring/cactus/commit/ec9683d38670fe5d657b602db8215e602fd4209d"
        },
        "date": 1724123906927,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "plugin-ledger-connector-besu_HTTP_GET_getOpenApiSpecV1",
            "value": 741,
            "range": "±3.20%",
            "unit": "ops/sec",
            "extra": "180 samples"
          }
        ]
      }
    ]
  }
}