window.requestIdleCallback(async function () {
  let checkCount = 0;
  let refColorElement = document.querySelector(
    '[data-testid="titleContainer"] svg'
  );
  const parser = new DOMParser();

  function injectButton() {
    mainColor = refColorElement
      ? getComputedStyle(refColorElement).color
      : "black";

    // Taken live from https://help.twitter.com/en/using-twitter/liking-tweets-and-moments
    // TODO: empty icon for light theme?
    const svgLikeIcon = parser.parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g>
  <path opacity="0" d="M0 0h24v24H0z"></path> 
  <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path>
</g></svg>`,
      "image/svg+xml"
    );

    const styles = parser.parseFromString(
      `<style type="text/css">
  .twt-likes-hover:hover {
      background-color: rgba(29, 161, 242, 0.1);
  }

  .twt-likes-hover:hover svg {
      color: ${mainColor};
  }

  .twt-likes-hover:hover span {
      color: ${mainColor};
  }

  @media screen and (max-width: 1264px) {
      .twt-likes-hover > div:nth-child(2) {
          display: none;
      }
  }
</style>`,
      "text/html"
    );
    document.head.appendChild(styles.documentElement.querySelector("style"));

    const nav = document.querySelector('header nav[role="navigation"]');
    const refLinks = nav.querySelectorAll('a[role="link"]');

    const refLink = refLinks[refLinks.length - 1];
    const username = refLink.href.split("/").pop();

    const newLink = refLink.cloneNode(true);
    const mainWrapper = newLink.firstChild;
    newLink.href = `/${username}/likes`;
    newLink.setAttribute("aria-label", "Likes");

    const svg = newLink.querySelector("svg");
    svg.replaceChildren(svgLikeIcon.documentElement.querySelector("g"));

    const textNode = newLink.querySelector("span");
    if (textNode) {
      // null in case we are on small layout (icons only)
      textNode.textContent = "Likes";
    }

    mainWrapper.classList.add("twt-likes-hover");

    refLink.parentNode.insertBefore(newLink, refLink);
  }

  async function checkForRefElement() {
    return new Promise((resolve) => {
      setTimeout(() => {
        refColorElement = document.querySelector(
          '[data-testid="titleContainer"] svg'
        );
        checkCount++;
        resolve();
      }, 500);
    });
  }

  const times = [checkForRefElement, checkForRefElement, checkForRefElement];

  for (t of times) {
    if (refColorElement) {
      break;
    }
    await t();
  }

  injectButton();
});
