/* ORIGINAL WORKING by stefan , july 23, 12:28 pm
Basic Structure:

const jsPsych = initJsPsych
- set the timeline to the timeline
- tell the experiment what to do at the end
--> this is automatically initiated through the index.html.

timeline: array that holds order for all trials
- Welcome Screen
- Training Trials: Made as a nested timeline, i.e. a timeline itself with all sentence trials


*/

/* ORIGINAL WORKING
Basic Structure:

const jsPsych = initJsPsych
- set the timeline to the timeline
- tell the experiment what to do at the end
--> this is automatically initiated through the index.html.

timeline: array that holds order for all trials
- Welcome Screen
- Training Trials: Made as a nested timeline, i.e. a timeline itself with all sentence trials


*/

const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: true,
    on_finish: function() {
      console.log("Experiment finished. Attempting to save data...");
      const save_data_config = {
          type: jsPsychPipe, // This will be defined by the pipe plugin
          action: "save",
          experiment_id: "LGifwnYbcef6",
          filename: window.filename, // Use the global filename
          data_string: ()=>jsPsych.data.get().csv()
      };

      fetch('https://pipe.jspsych.org/api/data/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              experiment_id: save_data_config.experiment_id,
              filename: save_data_config.filename,
              data: save_data_config.data_string()
            })
      })
      .then(response => response.json())
      .then(data => console.log('Data saved successfully:', data))
      .catch(error => console.error('Error saving data:', error));
  }
});


const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

let expInfo = {
  participant_id: jsPsych.data.getURLVariable('participant') || subject_id,
  participant_code: '',
  session: '001',
  test_version: ''
};

var timeline = [];

// =======================================TIMELINE=================================================//

/* Welcome Screen */
timeline.push({
  type: jsPsychSurveyText,
  questions: [{
    prompt: `Welcome! <b>${expInfo.participant_id}</b>.<br><br>Please copy the code onto here, and keep a note of it.`,
    name: "participant_code",
    required: false,
    placeholder: "e.g., John Doe"
  }],
  on_finish: function(data) {
    // expInfo.participant_code = data.response.participant_code || P${expInfo.participant_id};
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


// /* Main Trials */
// const csvList = [
//   'resources/AGL_1A.csv',
//   'resources/AGL_1B.csv',
//   'resources/AGL_2A.csv',
//   'resources/AGL_2B.csv'
// ];

const csvList = [
    'resources/AGL_1A_brief.csv'
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

    // Separate training vs other trials
    let trainingTrials = dataRows.filter(row => row.type.trim().toLowerCase() === 'train');
    let otherTrials = dataRows.filter(row => row.type.trim().toLowerCase() !== 'train');

    // Ensure we slice the correct number
    let first60Training = jsPsych.randomization.sampleWithoutReplacement(trainingTrials, 60);

    // Shuffle remaining training + other trials together
    // Exclude the selected 60 from the remaining training trials
    let remainingTraining = trainingTrials.filter(trial => !first60Training.includes(trial));
    let shuffledRemaining = jsPsych.randomization.shuffle(remainingTraining.concat(otherTrials));

    // Concatenate final ordered rows
    let orderedDataRows = first60Training.concat(shuffledRemaining);

    // Prepare list to track presentation order
    let presentedRows = [];

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
            jsPsych.setProgressBarValue((idx + 1) / orderedDataRows.length);
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

    // Shuffle Trial Order
    // Nested timeline with preserved order
    timeline.push({
      timeline: allTrials
    });

    // Thank you screen with upload
    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: 'Thank you for participating!<br><br>Press any key to finish.',
      choices: "ALL_KEYS",
      on_finish: function() {
        let csvHeader = Object.keys(presentedRows[0]).join(",") + "\n";
        let csvBody = presentedRows.map(row => Object.values(row).map(val =>
          `"${String(val).replace(/"/g, '""')}"`
        ).join(",")).join("\n");
        let csvContent = csvHeader + csvBody;

        // Upload to jsPsychPipe automatically
        fetch('https://pipe.jspsych.org/api/data/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                experiment_id: "LGifwnYbcef6",
                filename: `presentation_order_${selectedCSV.split('/').pop().split('.')[0]}_${subject_id}.csv`,
                data: csvContent
            })
        })
        .then(response => response.json())
        .then(data => console.log('Presentation order CSV uploaded successfully:', data))
        .catch(error => console.error('Error uploading presentation order CSV:', error));
      }
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        console.log("Escape key pressed. Saving and exiting...");
        jsPsych.endExperiment("You have exited the experiment.");

        const save_data_config = {
          experiment_id: "LGifwnYbcef6",
          filename: `${subject_id}_ESCAPE.csv`,
          data: jsPsych.data.get().csv()
        };

        fetch('https://pipe.jspsych.org/api/data/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(save_data_config)
        })
        .then(response => response.json())
        .then(data => console.log('Data saved on escape:', data))
        .catch(error => console.error('Error saving on escape:', error));
      }
    });

    jsPsych.run(timeline);
  });

//
