// Define an array of piano keys
const pianoKeys = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q"];

function generatePianoKeys() {
  const pianoKeysContainer = document.querySelector(".piano-keys");
  // Loop through the array of keys and generate HTML elements for each key
  pianoKeys.forEach((key) => {
    const keyElement = document.createElement("li");
    keyElement.className = "key";
    keyElement.dataset.key = key;
    keyElement.innerHTML = `<span>${key}</span>`;

    // Add the key element to the piano keys container
    pianoKeysContainer.appendChild(keyElement);
  });
}


