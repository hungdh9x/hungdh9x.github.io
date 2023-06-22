// use a class selector if available
let blocks = document.querySelectorAll('pre.highlight');

blocks.forEach((block) => {
  // only add button if browser supports Clipboard API
  if (navigator.clipboard) {
    let button = document.createElement("button");

    button.className = 'copy-code-button';
    block.appendChild(button);

    button.addEventListener("click", async () => {
      await copyCode(block, button);
    });
  }
});

async function copyCode(block, button) {
  let code = block.querySelector("code");
  let text = code.innerText;

  await navigator.clipboard.writeText(text);

  // visual feedback that task is completed
  button.className = 'copy-code-button copied';

  setTimeout(() => {
    button.className = 'copy-code-button';
  }, 700);
}

