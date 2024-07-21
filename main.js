const upButton = document.querySelector(".score-up");
const downButton = document.querySelector(".score-down");
const score = document.querySelector(".score");

function upClick() {
  score.innerText = parseInt(score.innerText) + 1;
}
function downClick() {
  if (+score.innerText > 0) {
    score.innerText = +score.innerText - 1;
  } else {
    score.classList.add("score-zero");
    setTimeout(() => {
      score.classList.remove("score-zero");
    }, 1000);
    // setTimeout(() => {
    //   console.log("1");
    // }, 1000);
    // setTimeout(() => {
    //   console.log("2");
    // }, 4000);
    // console.log("center");
    // setTimeout(() => {
    //   console.log("3");
    // }, 3000);
    // setTimeout(() => {
    //   console.log("4");
    // }, 2000);
  }
}

upButton.addEventListener("click", upClick);
downButton.addEventListener("click", downClick);
