
const btn = document.querySelector('.talk');
const content = document.querySelector('.content');


function speak(text) {
  const text_speak = new SpeechSynthesisUtterance(text);

  text_speak.rate = 1;
  text_speak.volume = 1;
  text_speak.pitch = 1;

  window.speechSynthesis.speak(text_speak);
}

function wishMe() {
  const day = new Date();
  const hour = day.getHours();

  if (hour >= 0 && hour < 12) {
    speak("Good Morning Boss...");
  } else if (hour > 12 && hour < 17) {
    speak("Good Afternoon Master...");
  } else {
    speak("Good Evening Sir...");
  }
}

window.addEventListener('load', () => {
  speak("Initializing JARVIS..");
  wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const currentIndex = event.resultIndex;
  const transcript = event.results[currentIndex][0].transcript;
  content.textContent = transcript;
  takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
  content.textContent = "Listening....";
  recognition.start();
});

function takeCommand(message) {
  if (message.includes('hey') || message.includes('hello')) {
    speak("Hello Sir, How May I Help You?");
  } else if (message.includes("open google")) {
    window.open("https://google.com", "_blank");
    speak("Opening Google...");
  } else if (message.includes("open youtube")) {
    window.open("https://youtube.com", "_blank");
    speak("Opening Youtube...");
  } else if (message.includes("open facebook")) {
    window.open("https://facebook.com", "_blank");
    speak("Opening Facebook...");
  } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
    window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
    const finalText = "This is what I found on the internet regarding " + message;
    speak(finalText);
  } else if (message.includes('wikipedia')) {
    window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "")}`, "_blank");
    const finalText = "This is what I found on Wikipedia regarding " + message;
    speak(finalText);
  } else if (message.includes('time')) {
    const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
    const finalText = "The current time is " + time;
    speak(finalText);
  } else if (message.includes('date')) {
    const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
    const finalText = "Today's date is " + date;
    speak(finalText);
  } else if (message.includes('calculator')) {
    window.open('Calculator:///');
    const finalText = "Opening Calculator";
    speak(finalText);
  } else if (message.includes('weather in')) {
    const city = message.replace('weather in', '').trim();
    getWeather(city);
  }
  else if(message.includes('tell me a joke')){
    tellJoke();
  } 
  else if(message.includes('play')){
    const searchQuery = message.replace('play', '').trim();
    if(searchQuery){
        SearchAndplay(searchQuery);
    }
    else{
        speak('Please specify the music you want to play');
    }
  }
  else if(message.includes('open camera')){
    openCamera();
  }

//Open Ai based conversation:
//   else if(message.includes('hey jarvis')){
//     const userInput = message.replace('hey jarvis', '').trim()
//     const response = getChatGPTResponse(userInput);
//     speak(response);
//   }
  
  else {
    window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
    const finalText = "I found some information for " + message + " on Google";
    speak(finalText);
  }
}


//Weather Section function:

function getWeather(city) {
  const apiKey = 'a51d10172bc2f95671c26b9c6ced2d3c'; // Replace with your OpenWeatherMap API key
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const temperature = data.main.temp;
      const description = data.weather[0].description;
      const weatherMessage = `The weather in ${city} is ${description} with a temperature of ${temperature}°C.`;
      const weatherResponse = document.createElement('li');
      weatherResponse.classList.add('message', 'weather-message');
      weatherResponse.textContent = weatherMessage;
      content.appendChild(weatherResponse);
      speak(weatherMessage);
    })
    .catch(error => {
      console.error('Error fetching weather data:', error);
      speak('Sorry, I could not fetch the weather information at the moment.');
    });
}

//Telling a joke function:

function tellJoke() {
    const jokeApiUrl = 'https://official-joke-api.appspot.com/random_joke';
  
    fetch(jokeApiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(jokeData => {
        const jokeSetup = jokeData.setup;
        const jokePunchline = jokeData.punchline;
        const jokeMessage = `${jokeSetup}... ${jokePunchline}`;
        
        const jokeResponse = document.createElement('li');
        jokeResponse.classList.add('message', 'joke-message');
        jokeResponse.textContent = jokeMessage;
        content.appendChild(jokeResponse);
        speak(jokeMessage);
      })
      .catch(error => {
        console.error('Error fetching joke:', error);
        speak('Sorry, I could not fetch a joke at the moment.');
      });
  }

//Play any video on youtube by saying feature implementation:

async function SearchAndplay(searchQuery) {
    const youtubeApiKey = 'AIzaSyDlfUDnDqMndeUXu4y9WqU7x34IJuc939A';
    const youtubeApiUrl = 'https://www.googleapis.com/youtube/v3/search';

    const options = {
        method: 'GET',
    };

    const queryParams = new URLSearchParams({
        q: encodeURIComponent(searchQuery),
        part: 'snippet',
        type: 'video',
        key: youtubeApiKey,
    });

    const apiUrl = `${youtubeApiUrl}?${queryParams}`;

    try {
        const response = await fetch(apiUrl, options);
        const data = await response.json();

        const video = data.items[0]; // Assuming the first item is a relevant video

        if (video) {
            playMusicYouTube(video);
        } else {
            speak('Sorry, no matching videos found.');
        }
    } catch (error) {
        console.error('Error searching for music on YouTube:', error);
        speak('Sorry, I could not search for music at the moment.');
    }
}

function playMusicYouTube(video) {
    const videoId = video.id.videoId;
    const title = video.snippet.title;


    const musicMessage = document.createElement('li');
    musicMessage.classList.add('message', 'music-message');
    musicMessage.textContent = `Now playing: ${title}`;
    content.appendChild(musicMessage);
    speak(`Playing now`);

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    window.open(videoUrl, '_blank');
}

//Openning and closing the Camera feature implementation:

function openCamera(){
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            // Create a video element and set the stream as the source
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            videoElement.autoplay = true;

            // Display the video element
            const cameraMessage = document.createElement('li');
            cameraMessage.classList.add('message', 'camera-message');
            cameraMessage.appendChild(videoElement);
            content.appendChild(cameraMessage);

            speak('Opening the camera.');
        })
        .catch(error => {
            console.error('Error opening the camera:', error);
            speak('Sorry, I could not open the camera at the moment.');
        });
}

//automating the responses from chatgpt(open source can be done by any individual)
// const axios = require('axios');

// const apiKey = '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';
// const apiUrl = 'https://api.openai.com/v1/engines/davinci-codex/completions'; // Adjust engine and endpoint accordingly

// async function getChatGPTResponse(prompt) {
//   try {
//     const response = await axios.post(apiUrl, {
//       prompt,
//       max_tokens: 150,
//     }, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${apiKey}`,
//       },
//     });

//     return response.data.choices[0].text.trim();
//   } catch (error) {
//     console.error('Error communicating with ChatGPT:', error);
//     return 'Sorry, I encountered an error.';
//   }
// }



