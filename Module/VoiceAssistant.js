// Speech Recognition Setup
const startVoiceBtn = document.getElementById("startVoice");
const endVoiceBtn = document.getElementById("endVoice");
const textInput = document.getElementById("textInput");

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    startVoiceBtn.onclick = function () {
        recognition.start();
        startVoiceBtn.textContent = "🎙 Listening...";
    };
    endVoiceBtn.onclick = function () {
        recognition.stop();
        startVoiceBtn.textContent = "🎤 Voice";
    };

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        textInput.value = transcript; // Set text in textarea
        startVoiceBtn.textContent = "🎤 Voice";
    };

    recognition.onerror = function () {
        startVoiceBtn.textContent = "🎤 Voice";
        alert("Speech recognition error! Try again.");
    };
} else {
    startVoiceBtn.style.display = "none"; // Hide button if unsupported
}

document.getElementById("clearText").addEventListener("click", () => {
    textInput.value = "";
});
