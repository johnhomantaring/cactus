window.BENCHMARK_DATA = {
  "lastUpdate": 1714551599773,
  "repoUrl": "https://github.com/johnhomantaring/cactus",
  "entries": {
    "Benchmark": [
      {
        "commit": {
          "author": {
            "email": "sandeep.nishad1@ibm.com",
            "name": "Sandeep Nishad",
            "username": "sandeepnRES"
          },
          "committer": {
            "email": "sandeepn.official@gmail.com",
            "name": "Sandeep Nishad",
            "username": "sandeepnRES"
          },
          "distinct": true,
          "id": "6be644738af14a164c95f0f2a81fba266584520a",
          "message": "ci: mitigate script injection attack in test_weaver-pre-release.yaml\n\nFixes the script injection attack mentioned here: https://hackerone.com/reports/2471956\n\nSigned-off-by: Sandeep Nishad <sandeep.nishad1@ibm.com>",
          "timestamp": "2024-04-26T16:02:10+05:30",
          "tree_id": "33d03a3ed64a3c3545902f45732332633a565b77",
          "url": "https://github.com/johnhomantaring/cactus/commit/6be644738af14a164c95f0f2a81fba266584520a"
        },
        "date": 1714551597653,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "cmd-api-server_HTTP_GET_getOpenApiSpecV1",
            "value": 532,
            "range": "±1.89%",
            "unit": "ops/sec",
            "extra": "175 samples"
          },
          {
            "name": "cmd-api-server_gRPC_GetOpenApiSpecV1",
            "value": 338,
            "range": "±1.73%",
            "unit": "ops/sec",
            "extra": "181 samples"
          }
        ]
      }
    ]
  }
}