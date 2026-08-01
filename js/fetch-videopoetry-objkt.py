#!/usr/bin/env python3
"""Obtiene tokens de la curaduria Videopoetry desde objkt GraphQL."""
import json
import urllib.request

ARTIFACTS = [
    "QmVwFitE7YpjxGDn2HnW4zdDahY52go9Uz5gjuK37zx3ma",
    "bafybeigw7iomkpflkkexfycrvnr6rjjxubtkqq6wjyioqhnqaabiph2vau",
    "QmYZMww93973NR3TkPLx46yfZaoL1evsTPQmxFvprmy9KJ",
    "QmWJRvL8psqbDmsVpUDjos6sbtzYnUvbpVae2UfQrpVJ6x",
    "bafybeidefuh6s74vrjn34ny2lyua6lkiodtm7fw2mfmqs3o2w4vdngnbom",
    "QmPWBhyjwxFUQgoJdpxVhKdiEvBwyTyBuBDaGKHAwqh8MK",
    "QmSDByK7zGyxmvSMtKwy5VAvR2up8oDzVMhz5TEG68xJfP",
    "bafybeigx5hvpenjckc3u75yf6omwkgnp7edlvgdcqmquf3pajxfyr3ueoq",
    "bafybeigp7enfgaephz6bzoi6m74x7u3velbppw26wv3zlxayzx7jlpd7au",
    "QmeFbMsSusUcNcZWffXVxYpnSmQfWv7F7mEGKKCd3WSTLq",
    "QmQcCKTT8i1jxCAQf2iFRdB2HB2cxV2fvKRmjPsFHv5EpL",
    "QmYZha8SanYaaB9SSCKo5T17tmVBbgTj2tSyJr4VoxLJGi",
    "QmQayqsMCEEdLpoT8U7mGyMgKnUPTADbSk7Kp2FiNVkQYS",
    "QmQcKkS6YHqzwttmvqMdnwZ4fSsNhrGE9X6xezPY4KV6MU",
    "bafybeigqtneasbupfavx4jnhdc42rmuh5knqymd7rgb44rnemiiq6pftou",
    "bafybeiavxcip3lpr5rtsapbta5l24d6qlq4hpnx3hwnqoarxgqavied6j4",
    "bafybeia76qozplsopdfwlz5lw6xh5zbrmlacfrfzdbbw2xm22g5sblsd7q",
]


def gql(query: str) -> dict:
    body = json.dumps({"query": query}).encode()
    req = urllib.request.Request(
        "https://data.objkt.com/v3/graphql",
        data=body,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def ipfs_url(uri: str | None) -> str:
    if not uri:
        return ""
    if uri.startswith("ipfs://"):
        cid = uri.replace("ipfs://", "")
        return f"https://assets.objkt.media/file/assets-003/{cid}/artifact"
    return uri


def find_token(hash_id: str) -> dict | None:
    uri = f"ipfs://{hash_id}"
    q = """
    query($uri: String!) {
      token(where: {artifact_uri: {_eq: $uri}}) {
        name fa_contract token_id thumbnail_uri display_uri artifact_uri
      }
    }
    """
    # variables not supported easily with simple urllib - inline
    q2 = f"""
    query {{
      token(where: {{artifact_uri: {{_eq: "{uri}"}}}}) {{
        name fa_contract token_id thumbnail_uri display_uri artifact_uri
      }}
    }}
    """
    data = gql(q2)
    tokens = data.get("data", {}).get("token") or []
    return tokens[0] if tokens else None


def main():
    results = []
    for h in ARTIFACTS:
        t = find_token(h)
        if t:
            thumb = ipfs_url(t.get("thumbnail_uri") or t.get("display_uri"))
            results.append({
                "artifact": h,
                "name": t["name"],
                "url": f"https://objkt.com/tokens/{t['fa_contract']}/{t['token_id']}",
                "thumb": thumb,
            })
            print(f"OK  {t['name']}")
        else:
            results.append({"artifact": h, "name": "", "url": "", "thumb": f"https://assets.objkt.media/file/assets-003/{h}/artifact"})
            print(f"MISSING {h}")
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
