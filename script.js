const apiKey = 'AIzaSyAc6B2bsnvZnS7T5UyNqQ5Pl0pS8IovTmg'; // Replace with your actual API key
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = 'en-US';

let isRecognitionRunning = false;


const predefinedResponses = {
  "what is your name": "My name is Edu Bot Ai.",
  "who is your developer": "Haseef Muhammed is my developer. You can visit his website at haseef-ws.netlify.app.",
  "who made you": "Made by by Haseef, Agney, Archith, and Niranjan.",
  "where are you from": "I belong to p.m.s.a.p.t.h.s.s Kakkove . ATL Lab",
  "who is your designer": "Agney. A. is a multifaceted talent, excelling as a singer, designer, and technician. With a passion for music, Agney A delivers captivating performances that resonate with audiences. His design skills and technical expertise complement his artistic endeavors, creating a unique blend of creativity and precision.",
  "create a welcome speech": "Hello everyone, Welcome to the launch of Edu Bot AI! We're excited to introduce this innovative AI-powered teacher, designed to make learning smarter, more personalized, and fun. Edu Bot AI is here to support students and teachers, making education more interactive and accessible. Thank you for joining us as we step into the future of education with Edu Bot AI.",
  "Introduce yourself": "My name is Edu Bot Ai , Iam a robot teacher , I will give the answer for every questions , I have many intractive feature ,"
};
recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    console.log('Transcript:', transcript);

    const normalizedTranscript = transcript.toLowerCase();

    if (normalizedTranscript.includes('hey teacher')) {
        const question = normalizedTranscript.replace(/hey teacher/i, '').trim();
        if (question) {
            if (predefinedResponses[question]) {
                const responseText = predefinedResponses[question];
                document.getElementById('responseText').textContent = responseText;
                speakText(responseText);
            } else {
                document.getElementById('responseText').textContent = `You asked: "${question}"`;
                fetchContent(question);
            }
        } else {
            document.getElementById('responseText').textContent = 'Please ask a question after saying "Hey Teacher".';
        }
    }
};

recognition.onend = () => {
    console.log('Recognition ended, restarting...');
    isRecognitionRunning = false;
    startRecognition();
};

function startRecognition() {
    if (!isRecognitionRunning) {
        recognition.start();
        isRecognitionRunning = true;
    }
}

startRecognition();

function fetchContent(text) {
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: text
                        }
                    ]
                }
            ]
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(errorMessage => {
                throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('API Response:', data);

        const candidates = data.candidates || [];
        const responseText = candidates.length > 0 && candidates[0].content && candidates[0].content.parts && candidates[0].content.parts[0] && candidates[0].content.parts[0].text;

        if (responseText) {
            const cleanedResponse = stripMarkdown(responseText);
            document.getElementById('responseText').textContent = cleanedResponse;
            speakText(cleanedResponse);
        } else {
            document.getElementById('responseText').textContent = 'No response from API.';
            startRecognition();
        }
    })
    .catch(error => {
        console.error('Error details:', error);
        document.getElementById('responseText').textContent = `Sorry, there was an error: ${error.message}`;
        startRecognition();
    });
}

// Function to strip markdown formatting from text
function stripMarkdown(text) {
    return text
        .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold formatting
        .replace(/\*([^\*]+)\*/g, '$1') // Remove italic formatting
        .replace(/(^|\s)#[^\s]+/g, '') // Remove headers
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
        .replace(/`{1,3}.*?`{1,3}/g, '') // Remove inline code and code blocks
        .trim();
}

// Function to read the text aloud with a female voice and limit to 20 seconds
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(voice => voice.name.includes('Male')) || voices[0];

    if (maleVoice) {
        utterance.voice = maleVoice;
    }

    const readTimeLimit = 60000; // 20 seconds
    let speakingTimeout;

    utterance.onend = () => {
        console.log('Speech ended.');
        document.getElementById('responseText').textContent += '\nYou can read from the screen.';
        clearTimeout(speakingTimeout);
        setTimeout(startRecognition, 1000); // Delay before restarting recognition
    };

    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        clearTimeout(speakingTimeout);
        setTimeout(startRecognition, 1000); // Delay before restarting recognition
    };

    // Stop recognition while speaking
    recognition.stop();
    isRecognitionRunning = false;
    window.speechSynthesis.speak(utterance);

    speakingTimeout = setTimeout(() => {
        window.speechSynthesis.cancel();
        document.getElementById('responseText').textContent += '\nYou can read from the screen.';
        setTimeout(startRecognition, 1000); // Delay before restarting recognition
    }, readTimeLimit); // Stop speaking after 20 seconds
}

// Ensure voices are loaded and set up
window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log('Voices:', voices);
};


// Dialog

const dialog = document.querySelector("dialog");
const showButton = document.querySelector("dialog + button");
const closeButton = document.querySelector("dialog button");

// "Show the dialog" button opens the dialog modally
 dialog.showModal();
// showButton.addEventListener("click", () => {
//   dialog.showModal();
// });

// "Close" button closes the dialog
closeButton.addEventListener("click", () => {
  dialog.close();
});

