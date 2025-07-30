//10.20PM 729 //* rewritten with ai assistance

const jsPsych = initJsPsych({
  show_progress_bar: true,
  auto_update_progress_bar: true,
  on_finish: () => {
    // This now only handles the local backup and console message.
    console.log("Experiment finished.");
    jsPsych.data.get().localSave('csv', filename);
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

// *** FIX #1: The 'presentedRows' array is moved here to the global scope. ***
let presentedRows = [];

/* Welcome Screen */
timeline.push({
  type: jsPsychSurveyText,
  questions: [{
    prompt: `Welcome! <b>${expInfo.participant_id}</b>.<br><br>Please copy the code onto here, and keep a note of it.`,
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

/* Instruction Page */
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'Welcome to the AGL experiment.<br><br>Press SPACE to start.',
  choices: [' ']
});
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'INSTRUCTIONS:<br><br>In the remote Island of Cairnland, some features of English have persisted in the language which have been largely lost in mainstream English.<br><br>The Cairnish people are known to use many suffixes we no longer use, but their meaning is not always clear.<br><br>You will be shown different sentences with these suffixed words, e.g., "sprintle". Your task is to learn the meaning of these words.<br><br> Based on that meaning you are learning, you will also have to guess the likely meaning of some new words.<br><br> Press SPACE to continue.',
  choices: [' ']
});
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: 'After reading each sentence carefully, press SPACE to continue onto the next sentence.<br><br>For some of the sentences, you will be asked if they make sense based on what you have learned.<br><br> For those sentences, press Y if they make sense, and press N if they do not make sense.<br><br>Press SPACE to continue to the next one.',
  choices: [' ']
});

// For testing, you are using the brief CSV.
// When ready, you can comment this block out...
const csvList = [
    'resources/AGL_1A_brief.csv'
];

/* ...and uncomment this block to use your full list.
 const csvList = [
   'resources/AGL_1A.csv',
   'resources/AGL_1B.csv',
   'resources/AGL_2A.csv',
   'resources/AGL_2B.csv'
 ];
*/

const selectedCSV = jsPsych.randomization.sampleWithoutReplacement(csvList, 1)[0];
console.log("Loaded CSV:", selectedCSV);

fetch(selectedCSV)
  .then(response => response.text())
  .then(csvData => {
    // *** FIX #2: ALL code that depends on the CSV data is now inside this .then() block ***

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });

    let dataRows = parsed.data;
    let trainingTrials = dataRows.filter(row => row.type.trim().toLowerCase() === 'train');
    let otherTrials = dataRows.filter(row => row.type.trim().toLowerCase() !== 'train');
    let first60Training = jsPsych.randomization.sampleWithoutReplacement(trainingTrials, 60);
    let remainingTraining = trainingTrials.filter(trial => !first60Training.includes(trial));
    let shuffledRemaining = jsPsych.randomization.shuffle(remainingTraining.concat(otherTrials));
    let orderedDataRows = first60Training.concat(shuffledRemaining);

    const allTrials = orderedDataRows.map((row, idx) => {
      let trialChoices;
      if (row.type === 'train') {
        trialChoices = [' '];
      } else if (row.type === 'comprehension' || row.type === 'generalization') {
        trialChoices = ['y', 'n'];
      } else {
        trialChoices = 'ALL_KEYS';
      }

      return {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: row.type === 'comprehension' || row.type === 'generalization'
          ? `<p>${row.sentence}</p><p><em>Does this make sense? Press Y or N.</em></p>`
          : `<p>${row.sentence}</p><p><em>Press Space to Continue</em></p>`,
        choices: trialChoices,
        on_start: function() {
            presentedRows.push({
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
            sentence: row.sentence
          });
        },
        on_finish: function(data) {
          data.rt_sec = data.rt ? (data.rt / 1000).toFixed(3) : null;
          if (row.type === 'comprehension' || row.type === 'generalization') {
            data.response_YN = data.response;
          }
        }
      };
    });

    timeline.push({
      timeline: allTrials
    });

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: "Thank you for participating!<br><br>Your data is now being saved.",
      trial_duration: 3000 // Give the user a moment to see the message
    });

    // *** STEP 1: DEBUGGER TRIAL - DOES A SIMPLE SAVE WORK? ***
    timeline.push({
        type: jsPsychPipe,
        action: 'save',
        experiment_id: "LGifwnYbcef6",
        filename: `DEBUG_TEST_${subject_id}.txt`,
        data_string: "Hello DataPipe! If you see this file, the connection is working."
    });


    // *** STEP 2: INSPECT THE DATA BEFORE SAVING ***
    timeline.push({
        type: jsPsychCallFunction,
        func: () => {
            // Log the presentation order data
            try {
                const presentation_header = Object.keys(presentedRows[0]).join(',');
                const presentation_rows = presentedRows.map(row => Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
                const presentation_data = `${presentation_header}\n${presentation_rows.join('\n')}`;
                console.log("--- Presentation Order Data ---");
                console.log(presentation_data);
            } catch (e) {
                console.log("--- Error creating presentation order data ---", e);
            }

            // Log the main experiment data
            try {
                const main_data = jsPsych.data.get().csv();
                console.log("--- Main Experiment Data ---");
                console.log(main_data);
            } catch (e) {
                console.log("--- Error creating main experiment data ---", e);
            }
        }
    });


    // *** STEP 3: YOUR ORIGINAL SAVE TRIALS (UNCHANGED) ***

 // *** PIPE TRIAL #1: SAVE THE PRESENTATION ORDER ***
    timeline.push({
        type: jsPsychPipe,
        action: 'save',
        experiment_id: "LGifwnYbcef6",
        filename: `presentation_order_${selectedCSV.split('/').pop().split('.')[0]}_${subject_id}.csv`,
        // Use data_string to send the data
        data_string: () => {
            if (presentedRows.length === 0) return "";
            const header = Object.keys(presentedRows[0]).join(',');
            const rows = presentedRows.map(row => 
                Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
            );
            return `${header}\n${rows.join('\n')}`;
        }
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        console.log("Escape key pressed. Ending experiment...");
        // This will stop the experiment and trigger the on_finish function above
        jsPsych.endExperiment("You have exited the experiment early.");
      }
    });

    // *** PIPE TRIAL #2: SAVE THE MAIN EXPERIMENT DATA ***
    timeline.push({
        type: jsPsychPipe,
        action: 'save',
        experiment_id: "LGifwnYbcef6",
        filename: filename, // The main filename, e.g., "xxxxx.csv"
        // Use data_string to send the data
        data_string: () => jsPsych.data.get().csv()
    });

    // Now it is safe to run the experiment
    jsPsych.run(timeline);

 })
  .catch(error => {
    console.error('Error loading or parsing CSV data:', error);
    document.body.innerHTML = `<p>A critical error occurred while loading the experiment. Please contact the researcher.</p>`;
  });

