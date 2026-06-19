/*
  Portfolio media map
  -------------------
  The website checks these paths automatically. Missing files leave the
  designed placeholder visible. Add the exact files listed below and reload.
*/

window.PORTFOLIO_MEDIA = {
  portrait: {
    type: "image",
    src: "about me/picture of me.jpeg",
    alt: "Portrait of Muhammad Zarul Aziri Bin Maamur"
  },
  heroAction: {
    type: "image",
    src: "assets/images/hero-action.jpg",
    alt: "Muhammad Zarul working on a technology project"
  },
  teaching: {
    type: "image",
    src: "assets/images/teaching.jpg",
    alt: "Muhammad Zarul teaching mathematics"
  },
  team: {
    type: "image",
    src: "assets/images/team.jpg",
    alt: "Muhammad Zarul collaborating with a team"
  },
  showreel: {
    type: "video",
    src: "assets/videos/portfolio-showreel.mp4"
  },
  schoolshieldCover: {
    type: "image",
    src: "project/schoolshield/cover.jpg",
    alt: "SchoolShield project overview with Android screens and system architecture"
  },
  schoolshieldApp: {
    type: "image",
    src: "project/schoolshield/dashboard.png",
    alt: "SchoolShield Android dashboard"
  },
  schoolshieldAi: {
    type: "image",
    src: "project/schoolshield/incidents.png",
    alt: "SchoolShield incident evidence screen"
  },
  schoolshieldDemo: {
    type: "video",
    src: "assets/videos/schoolshield-demo.mp4"
  },
  mathTutorCover: {
    type: "image",
    src: "project/math-tutor/cover.jpg",
    alt: "Math Tutor live online mathematics classroom project overview"
  },
  mathTutorClassroom: {
    type: "image",
    src: "project/math-tutor/live-room.png",
    alt: "Math Tutor live lesson room"
  },
  mathTutorDashboard: {
    type: "image",
    src: "project/math-tutor/teacher-dashboard.png",
    alt: "Math Tutor teacher dashboard"
  },
  mathTutorDemo: {
    type: "video",
    src: "assets/videos/math-tutor-demo.mp4"
  },
  workshop: {
    type: "image",
    src: "assets/images/creative-presenters-workshop.jpg",
    alt: "Creative Presenters PowerPoint and Canva workshop"
  },
  cybershield: {
    type: "image",
    src: "assets/images/cybershield-ramadan.jpg",
    alt: "Cybershield Ramadan community program"
  },
  heartsForHope: {
    type: "image",
    src: "assets/images/hearts-for-hope.jpg",
    alt: "Hearts for Hope fundraising program"
  },
  communityReel: {
    type: "video",
    src: "assets/videos/community-reel.mp4"
  }
};

function loadImage(slot, config) {
  const image = new Image();
  image.alt = config.alt || "";
  image.loading = slot.dataset.mediaKey === "portrait" ? "eager" : "lazy";
  image.decoding = "async";
  image.addEventListener("load", () => {
    slot.classList.add("media-loaded");
  });
  slot.appendChild(image);
  image.src = config.src;
}

function loadVideo(slot, config) {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.controls = true;
  video.playsInline = true;
  video.addEventListener("loadedmetadata", () => {
    slot.appendChild(video);
    slot.classList.add("media-loaded");
  });
  video.src = config.src;
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-media-key]").forEach((slot) => {
    const config = window.PORTFOLIO_MEDIA[slot.dataset.mediaKey];
    if (!config) return;
    if (config.type === "video") loadVideo(slot, config);
    else loadImage(slot, config);
  });
});
