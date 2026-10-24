// Collection items - 5 films from the folder, matched to objkt tokens 2-6.
window.VIDEO_SERIES_ITEMS = [
  {
    name: "make the seaweed dance",
    url: "https://objkt.com/tokens/KT1Q4XJL7Y9jStWCXsfTTT1RvLNL5j31wU63/2",
    thumb: "thumbs/02-make-the-seaweed-dance.jpg",
    artifact: "bafybeib32hurwtetm3ienhw3fb25psf3doi5gteo5xiw64mpkjx65nbchy",
  },
  {
    name: "Going backward is also moving forward",
    url: "https://objkt.com/tokens/KT1Q4XJL7Y9jStWCXsfTTT1RvLNL5j31wU63/3",
    thumb: "thumbs/03-going-backward-is-also-moving-forward.jpg",
    artifact: "bafybeiglrvtdzxn33uk64nrey6x5gutvh2r2sdwudn4532v4pb2sv54vku",
  },
  {
    name: "Enhance the connections between us",
    url: "https://objkt.com/tokens/KT1Q4XJL7Y9jStWCXsfTTT1RvLNL5j31wU63/4",
    thumb: "thumbs/04-enhance-the-connections-between-us.jpg",
    artifact: "bafybeiawf2u3qb7n23kpds5nqut3cdqoboedhzvzzvzkvscs5auh34vqiy",
  },
  {
    name: "All that darkness made us shine",
    url: "https://objkt.com/tokens/KT1Q4XJL7Y9jStWCXsfTTT1RvLNL5j31wU63/5",
    thumb: "thumbs/05-all-that-darkness-made-us-shine.jpg",
    artifact: "bafybeih3rqe7tbdlp2vmz6pjwnr2rru3eudsse4g3jfqihbu26plmq5jaa",
  },
  {
    name: "transcendental nature of this point of view",
    url: "https://objkt.com/tokens/KT1Q4XJL7Y9jStWCXsfTTT1RvLNL5j31wU63/6",
    thumb: "thumbs/06-transcendental-nature-of-this-point-of-view.jpg",
    artifact: "bafybeigpenktneal6djd6ea52eiqzl2x4llrbsoroft5mwb4qlfaexyisq",
  },
];

// Artifact URL helper - objkt CDN path, loaded only when the visitor hits play.
window.videopoetryArtifactUrl = function (artifact) {
  if (!artifact) return "";
  return "https://assets.objkt.media/file/assets-003/" + artifact + "/artifact";
};
