//final comments

const jsPsych = initJsPsych({
  show_progress_bar: true,
  auto_update_progress_bar: true,
  on_finish: () => {
    // This now only handles the local backup and console message.
    console.log("Experiment finished.");
    // jsPsych.data.get().localSave('csv', filename);
  }
});

const subject_id = jsPsych.randomization.randomID(10);
const subject_code = jsPsych.randomization.randomID(6);
const filename = `${subject_id}.csv`;

let expInfo = {
  participant_id: jsPsych.data.getURLVariable('participant') || subject_id,
  participant_code: jsPsych.data.getURLVariable('code') || subject_code,
  session: '001',
  test_version: '01'
};
var timeline = [];
// =======================================TIMELINE=================================================//

/* Welcome Screen */

timeline.push({
  type: jsPsychSurveyMultiChoice,
  preamble: `
    <div style="text-align: center;">
      <img src="resources/consentform.jpg" alt="Consent Form" style="max-width: 100%; height: auto;">
    </div>
    <p>Please read the consent form above. You must agree in order to participate.</p>
  `,
  questions: [
    {
      prompt: "I consent to participate in this study.",
      name: "consent",
      options: ["Yes, I consent"],
      required: true
    }
  ],
  on_finish: function(data) {
    jsPsych.data.addProperties({
      consent_given: data.response.consent === "Yes, I consent"
    });
  }
});

// timeline.push({
//   type:jsPsychHtmlKeyboardResponse,
//   stimulus: 'Hello! THIS IS A TEST VERSION. EXIT THIS EXPERIMENT PLEASE AND WAIT FOR A FEW HOURS! This experiment only works on a laptop using Chrome.<br><br> If you are not on your laptop or using Chrome, please switch now.<br><br>Thank you!<br><br>Press SPACE to continue.',
//   choices: [' ']
// });

timeline.push({
  type:jsPsychHtmlKeyboardResponse,
  stimulus: 'Hello! This experiment only works on a laptop using Chrome.<br><br> If you are not on your laptop or using Chrome, please switch now.<br><br>Thank you!<br><br>Press SPACE to continue.',
  choices: [' ']
});

timeline.push({
  type: jsPsychSurveyText,
  questions: [{
    prompt: `Welcome! This is your code: <b>${expInfo.participant_id}</b>.<br><br>Please copy the code onto here, and keep a note of it.`,
    name: "participant_code",
    required: false,
    placeholder: "e.g., xd237de731"
  }],
  on_finish: function(data) {
    expInfo.participant_code = data.response.participant_code || `P${expInfo.participant_code}`;
    let numeric_id = parseInt(expInfo.participant_id, 10);
    if (isNaN(numeric_id)) numeric_id = Array.from(expInfo.participant_id).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const versionMap = {1: '1A', 2: '1B', 3: '2A', 4: '2B'};
    const participantNumForVersion = ((numeric_id - 1) % 4) + 1;
    expInfo.test_version = versionMap[participantNumForVersion];
    jsPsych.data.addProperties({
      participant_id: expInfo.participant_id,
      participant_code: expInfo.participant_code,
      session: expInfo.session,
      test_version: expInfo.test_version
    });
  }
});

/* Prolific ID */
timeline.push({
  type: jsPsychSurveyText,
  questions: [{
    prompt: "Please enter Prolific ID here, if applicable (or write NA).",
    name: "prolificid",
    required: true,
    placeholder: "e.g. 45gfsx52"
  }],
  on_finish: function(data) {
    jsPsych.data.addProperties({
      age: data.response.prolificid
    });
  }
});

/* Instruction Page */
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Welcome to the AGL experiment.<br><br>Press SPACE to start.',
  choices: [' ']
});

//                                                                                      DEMOGRAPHICS
// Age entry
timeline.push({
  type: jsPsychSurveyText,
  questions: [{
    prompt: "What is your age?",
    name: "age",
    required: true,
    placeholder: "e.g. 26"
  }],
  on_finish: function(data) {
    jsPsych.data.addProperties({
      age: data.response.age
    });
  }
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "What is your gender?<br><br>Press F for female, M for male, N for nonbinary, or X for prefer not to say",
  choices: ['f', 'm', 'n', 'x'],
  on_finish: function(data) {
    jsPsych.data.addProperties({
      gender: data.response
    });
  }
});

// Are you fluent in English? (Y/N)
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Are you fluent in English?<br><br>Press <strong>Y</strong> for Yes or <strong>N</strong> for No.",
  choices: ['y', 'n'],
  on_finish: function(data) {
    jsPsych.data.addProperties({
      english_fluent: data.response
    });
  }
});

// Is English your native language? (Y/N)
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: "Is English your native language?<br><br>Press <strong>Y</strong> for Yes or <strong>N</strong> for No.",
  choices: ['y', 'n'],
  on_finish: function(data) {
    jsPsych.data.addProperties({
      english_native: data.response
    });
  }
});

// Ask for native language ONLY IF English is NOT native
// Ask native language & when they learned English IF not a native speaker
timeline.push({
  timeline: [
    {
      type: jsPsychSurveyText,
      questions: [{
        prompt: "What is your native language?",
        name: "native_language",
        required: true,
        placeholder: "e.g. Arabic"
      }],
      on_finish: function(data) {
        jsPsych.data.addProperties({
          native_language: data.response.native_language
        });
      }
    },
    {
      type: jsPsychSurveyText,
      questions: [{
        prompt: "When did you start learning English?",
        name: "english_start_age",
        required: true,
        placeholder: "e.g. 5"
      }],
      on_finish: function(data) {
        jsPsych.data.addProperties({
          english_start_age: data.response.english_start_age
        });
      }
    }
  ],
  conditional_function: function() {
    const lastData = jsPsych.data.get().last(1).values()[0];
    return lastData.response === 'n';
  }
});

// Ask about other languages (always shown)
timeline.push({
  type: jsPsychSurveyText,
  questions: [{
    prompt: "Do you speak other languages? List them here:",
    name: "other_languages",
    required: false,
    placeholder: "e.g. French, Armenian"
  }],
  on_finish: function(data) {
    jsPsych.data.addProperties({
      other_languages: data.response.other_languages
    });
  }
});
//                                                                      INSTRUCTIONS
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'INSTRUCTIONS:<br><br>In the remote Island of Cairnland, English is the main language. However, over the years, the Cairnish people’s English<br><br>has changed to be different from yours. Although their English is largely understandable, many words have endings (suffixes)<br><br>that standard English does not have, but they are not always clear. Linguists are trying to<br><br>understand the meaning of these words and suffixes from Cairnland, and they are interested to see how normal speakers of English understand Cairnish English.<br><br>In this experiment, you will be reading sentences written by a few Cairnish people. Your task will be<br><br>to learn what these Cairnish words mean. Based on your learning, you will have to make an educated guess about the likely meaning of some new words.<br><br>Press SPACE to continue.',
  choices: [' ']
});
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'After reading each sentence carefully, try to understand the general meaning of the new word in it based on its context.<br><br>For example, you might read a sentence that says "The drinkle is on the kitchen table." When you read this, pause and think,<br><br>what might be on a kitchen table, and is related to drinking?<br><br>A glass, a mug, a teapot, maybe. To check if you are starting to understand Cairnish, you will sometimes<br><br>be asked if another sentence with a word you saw (e.g. "drinkle") makes sense.<br><br>"The drinkle has a wooden handle" This might make sense. The drinkle is on the table, so it must be something small, and it has something to do for drinking, like a mug? A mug can have a handle! YES, it makes sense<br><br>“The drinkle is closed on Tuesdays” This makes less sense. If it is on the table in the kitchen, then how could it be "closed on Tuesdays"? NO, this does not make sense, and is a wrong use of the word drinkle.<br><br>Press SPACE to continue',
  choices: [' ']
});
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'You will not get tested after each of the sentences. <br><br>Just make sure you have understood the likely meaning of the word <br><br>before you move on to the next sentence by pressing SPACE. <br><br>You might not memorize most of the words, but we do not expect anyoneto learn Cairnish English in just a day!<br><br>Press SPACE to continue',
  choices: [' ']
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `Let's practice. When you are presented with a sentence, think of what the new word in it might mean based on the sentence it is in.<br><br>When asked if the sentence made sense, press 1 for YES and 0 for NO<br><br>Press SPACE to continue.`,
  choices: [' ']
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `"The hardware store ran out of fixocks."<br><br><strong>Think of the likely meaning of FIXOCK.</strong><br>Press SPACE to continue.`,
  choices: [' ']
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `"Sam managed to break the fixock."<br><br><strong>Made sense?</strong><br>Press 1 for YES and 0 for NO.`,
  choices: ['1', '0'],
  data: { trial_id: 'practice1' }
});

timeline.push({
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `Incorrect! This made sense.<br><br>A fixock being breakable and also being sold at the hardware store don't seem contradictory,<br><br>since both descriptions fit with it being the same thing (a hammer, pliers, or maybe a magic Cairnish tool that fixes almost anything).<br><br>Press SPACE to continue.`,
      choices: [' ']
    }
  ],
  conditional_function: function(){
    return jsPsych.data.get().last(1).values()[0].response === '0';
  }
});

timeline.push({
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `Correct! This made sense.<br><br>A fixock being breakable and also being sold at the hardware store are not contradictory,<br><br>and they can easily describe the same thing (a hammer, pliers, or maybe a handy Cairnish tool that fixes almost anything).<br><br>Press SPACE to continue.`,
      choices: [' ']
    }
  ],
  conditional_function: function(){
    return jsPsych.data.get().last(1).values()[0].response === '1';
  }
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `"Sam works at the fixock nearby."<br><br><strong>Made sense?</strong><br>Press 1 for YES and 0 for NO.`,
  choices: ['1', '0'],
  data: { trial_id: 'practice2' }
});

timeline.push({
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `Correct! This did not make sense.<br><br>We learned that fixocks are sold at the hardware store (so they are some tool). So how does Sam work at a fixock?<br><br>This does not make sense , so the second sentence is not using the word 'fixock' correctly.<br><br>Press SPACE to continue.`,
      choices: [' ']
    }
  ],
  conditional_function: function(){
    return jsPsych.data.get().last(1).values()[0].response === '0';
  }
});

timeline.push({
  timeline: [
    {
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `Incorrect! This did not make sense.<br><br>We learned that fixocks are sold at the hardware store (so they are some tool). So how does Sam work at a fixock?<br><br>This does not make sense , so the second sentence is not using the word 'fixock' correctly.<br><br>Press SPACE to continue.`,
      choices: [' ']
    }
  ],
  conditional_function: function(){
    return jsPsych.data.get().last(1).values()[0].response === '1';
  }
});

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Great! This was an example for you to get the idea.<br><br>In the experiment, you will be shown many factual sentences before you are shown "made sense" trials. Try your best to remember the words you are seeing (do not write anything down!)<br><br>If that is too hard, a general idea of the rule is also good. Good luck!<br><br>Press SPACE to continue.',
  choices: [' ']
});


// For testing, we are using the brief CSV (quick click through takes about 2-3 min, or 9 min of full reading).
// When ready, you can comment this block out...
// const csvList = [
//     'resources/AGL_1A_brief.csv'
// ];

//                                                                         EXPERIMENT!!!! ---------------------------------------------------------------------------------------
 const csvList = [
   'resources/AGL_1A.csv',
   'resources/AGL_1B.csv',
   'resources/AGL_2A.csv',
   'resources/AGL_2B.csv'
 ];


const selectedCSV = jsPsych.randomization.sampleWithoutReplacement(csvList, 1)[0];
console.log("Loaded CSV:", selectedCSV);

fetch(selectedCSV)
  .then(response => response.text())
  .then(csvData => {
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });

    let dataRows = parsed.data;

    // === Step 1: Count total times each word appears ===
    let wordCounts = {};
    dataRows.forEach(row => {
      const word = row.word?.trim();
      if (word) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });


    // === Step 2: Get all train words ===
    const trainingTrials = dataRows.filter(row => row.type.trim().toLowerCase() === 'train');
    const trainWords = new Set(trainingTrials.map(row => row.word?.trim()));

    // === Step 3: Filter other trials to exclude comprehension words not seen in train ===
    let otherTrials = dataRows.filter(row => {
      const type = row.type.trim().toLowerCase();
      if (type === 'train') return false; // already in training
      if (type === 'comprehension') {
        return trainWords.has(row.word?.trim()); // keep only if seen in train
      }
      return true; // keep generalization and others
    });

    // === Step 4: Sample and combine ===
    const first60Training = jsPsych.randomization.sampleWithoutReplacement(trainingTrials, 60);
    const remainingTraining = trainingTrials.filter(trial => !first60Training.includes(trial));
    const shuffledRemaining = jsPsych.randomization.shuffle(remainingTraining.concat(otherTrials));
    const orderedDataRows = first60Training.concat(shuffledRemaining);

    // === Step 5: Add running times_exposed based on final order ===
    let runningCounts = {};
      orderedDataRows.forEach(row => {
        const word = row.word?.trim();
        if (word) {
          if (!runningCounts[word]) {
            runningCounts[word] = 1;
          } else {
            runningCounts[word]++;
          }
          row.times_exposed = runningCounts[word];
        } else {
          row.times_exposed = 0;
        }
      });

    // === Step 6: Generate jsPsych trial objects ===
    const allTrials = orderedDataRows.map((row, idx) => {
      let trialChoices;
      const type = row.type.trim().toLowerCase();

      if (type === 'train') {
        trialChoices = [' '];
      } else if (type === 'comprehension' || type === 'generalization') {
        trialChoices = ['1', '0'];
      } else {
        trialChoices = 'ALL_KEYS';
      }

      return {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: (type === 'comprehension' || type === 'generalization')
          ? `<p>${row.sentence}</p><p><em>Does this make sense? Press 1 or 0.</em></p>`
          : `<p>${row.sentence}</p><p><em>Press Space to Continue</em></p>`,
        choices: trialChoices,
        data: { 
          presentation_order: idx + 1,
          participant_id: expInfo.participant_id,
          test_version: expInfo.test_version,
          session: expInfo.session,
          index: row.index,
          verb: row.verb,
          word: row.word,
          suffix: row.suffix,
          tokens: row.tokens,
          meaning_abs: row.meaning_abs,
          original_meaning: row.original_meaning,
          meaning_item: row.meaning_item,
          traintest: row.traintest,
          match: row.match,
          type: row.type,
          cond: row.cond,
          sentence: row.sentence,
          times_exposed: row.times_exposed
        },
        on_finish: function(data) {
          data.rt_sec = data.rt ? (data.rt / 1000).toFixed(3) : null;
          if (type === 'comprehension' || type === 'generalization') {
            data.response_YN = data.response;
          }
        }
      };
    });

    timeline.push({
      timeline: allTrials
    });

    // === Step 7: Recap Instruction Screen ===
    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `Great, you have completed the main part of the experiment!<br><br>Now we will recap what you have learned about the Cairnish vocabulary.<br><br>Press SPACE to continue.`,
      choices: [' ']
    });
    
    // === Step 8: Extract Unique Words ===
    const uniqueSeenWords = Array.from(
      new Set(orderedDataRows.map(row => row.word?.trim()).filter(Boolean))
    );
    
    // === Step 9: Shuffle Words and Create Recap Trials ===
    const shuffledRecapWords = jsPsych.randomization.shuffle(uniqueSeenWords);
    
    const recapTrials = shuffledRecapWords.map((word, index) => ({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<p><strong>${word}</strong><br><br>What does this word mean?</p><p>Press <strong>P</strong> for <strong>PLACE</strong> or <strong>O</strong> for <strong>OBJECT</strong></p>`,
      choices: ['P', 'O'],
      data: {
        trial_tag: 'final_learning',
        recap_word: word,
        presentation_order: index + 1
      },
      on_finish: function(data) {
        data.response_YN = data.response;
      }
    }));
    
    timeline.push({
      timeline: recapTrials
    });

    const finalComments = {
      type: jsPsychSurveyText,
      questions: [
        {
          prompt: "Would you like to leave any comments for the experimenter? (Optional)<br><br>PLEASE GO TO THE NEXT PAGE TO SAVE DATA!",
          rows: 6,
          columns: 80,
          placeholder: "Type your comments here..."
        }
      ],
      data: { trial_tag: "final_comments" }
    };

    timeline.push(finalComments);

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: "Thank you for participating!<br><br>Your data is now being saved. Please wait and continue.",
      trial_duration: 3000 // Give the user a moment to see the message
    });
    
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        console.log("Escape key pressed. Ending experiment...");
        // This will stop the experiment and trigger the on_finish function above
        jsPsych.endExperiment("You have exited the experiment early.");
      }
    });

   // PIPE TRIAL #2: SAVE THE MAIN EXPERIMENT DATA (with failsafe)
    timeline.push({
        type: jsPsychPipe,
        action: 'save',
        experiment_id: "LGifwnYbcef6",
        filename: filename,
        data_string: () => {
            const data = jsPsych.data.get().csv();
            // If main data is empty, send a placeholder.
            return data ? data : "main_data_is_empty";
        }
    });

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: 'The Island of Cairnland and the Cairnish people are fictional, they were made up for the sake of this study.<br><br>Thank you for participating!<br><br>Your prolific code is C1EX0BR7<br><br>Press SPACE to finish.',
      choices: [' ']
    });
    
    jsPsych.run(timeline);
  })
  .catch(error => {
    console.error('Error loading or parsing CSV data:', error);
    document.body.innerHTML = `<p>A critical error occurred while loading the experiment. Please contact the researcher.</p>`;
  });
