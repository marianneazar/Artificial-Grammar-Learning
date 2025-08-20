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
  stimulus: 'You will not get tested after each of the sentences. <br><br>Just make sure you have understood the likely meaning of the word <br><br>before you move on to the next sentence by pressing SPACE. <br><br>You probably will not memorize most of the words, but we do not expect anyone to learn Cairnish English in just a day!<br><br>Press SPACE to continue',
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

    // --- Clean & split by type ---
    const rawRows = parsed.data.filter(r => r && r.type);
    const normType = r => String(r.type).trim().toLowerCase();

    const trainingRows = rawRows.filter(r => normType(r) === 'train' && r.word);
    const compRowsAll  = rawRows.filter(r => normType(r) === 'comprehension' && r.word);
    const genRowsAll   = rawRows.filter(r => normType(r) === 'generalization');

    // --- Unique TRAIN words & their token size ---
    // tokens column indicates repeats per word and is identical across that word’s rows.
    // Build: word -> tokenSize (numeric), and word -> all its TRAIN rows
    const wordToToken = {};
    const wordToTrainRows = {};
    trainingRows.forEach(row => {
      const w = String(row.word).trim();
      const t = Number(row.tokens) || 0;
      if (!wordToTrainRows[w]) wordToTrainRows[w] = [];
      wordToTrainRows[w].push(row);
      if (!wordToToken[w]) wordToToken[w] = t;
    });

    const uniqueTrainWords = Object.keys(wordToTrainRows); // should be 84
    // Group unique words by token size
    const tokenLevels = [8, 6, 4, 3, 2, 1];
    const tokenGroups = Object.fromEntries(tokenLevels.map(k => [k, []]));
    uniqueTrainWords.forEach(w => {
      const t = wordToToken[w];
      if (tokenGroups[t]) tokenGroups[t].push(w);
      else {
        // if a word has an unexpected token value, bucket it into the smallest group
        if (!tokenGroups[1]) tokenGroups[1] = [];
        tokenGroups[1].push(w);
      }
    });
    // Shuffle each token group
    tokenLevels.forEach(t => {
      tokenGroups[t] = jsPsych.randomization.shuffle(tokenGroups[t]);
    });

    // --- Build 6 blocks of unique words via round-robin across token groups (balances tokens across blocks) ---
    const N_BLOCKS = 6;
    const blocksWordSets = Array.from({ length: N_BLOCKS }, () => new Set());

    tokenLevels.forEach(t => {
      const words = tokenGroups[t] || [];
      for (let i = 0; i < words.length; i++) {
        blocksWordSets[i % N_BLOCKS].add(words[i]);
      }
    });
    // Each block should end up with ~84/6 = 14 words (exact if data are well-formed).

    // --- Build comprehension pool by word (only comp for words seen in a block) ---
    const compByWord = {};
    compRowsAll.forEach(r => {
      const w = String(r.word).trim();
      if (!compByWord[w]) compByWord[w] = [];
      compByWord[w].push(r);
    });
    Object.keys(compByWord).forEach(w => {
      compByWord[w] = jsPsych.randomization.shuffle(compByWord[w]);
    });

    // --- Generalization: single global pool, 42 total → 7 per block (no repeats) ---
    const genPool = jsPsych.randomization.shuffle(genRowsAll.slice());
    const GEN_PER_BLOCK = Math.floor(genPool.length / N_BLOCKS); // 7

    // Running exposure counts across the *whole* experiment (all blocks)
    const runningCounts = {};

    // For presentation ordering across the whole experiment
    let globalOrder = 0;

    // Helper to map a CSV row into a jsPsychHtmlKeyboardResponse trial object
    function makeTrialFromRow(row, opts = {}) {
      const tType = normType(row);
      const isYN = (tType === 'comprehension' || tType === 'generalization');
      const stim = isYN
        ? `<p>${row.sentence}</p><p><em>Does this make sense? Press 1 or 0.</em></p>`
        : `<p>${row.sentence}</p><p><em>Press Space to Continue</em></p>`;

      // update running exposure
      let w = row.word ? String(row.word).trim() : null;
      if (w) {
        runningCounts[w] = (runningCounts[w] || 0) + 1;
      }

      const trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: stim,
        choices: isYN ? ['1', '0'] : [' '],
        data: {
          presentation_order: ++globalOrder,
          block: opts.blockIndex ?? null,
          block_phase: opts.phase ?? null, // 'train' | 'comprehension' | 'generalization' | 'recap'
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
          typicality: row.typicality,
          traintest: row.traintest,
          match: row.match,
          type: row.type,
          cond: row.cond,
          sentence: row.sentence,
          times_exposed: w ? runningCounts[w] : 0
        },
        on_finish: function (data) {
          data.rt_sec = data.rt ? (data.rt / 1000).toFixed(3) : null;

          // Save responses in a single uppercase column
          const isCompGen = (tType === 'comprehension' || tType === 'generalization');
          const isPO = !!data.categorization_question;
          if (isCompGen || isPO) {
            if (data.response !== null && data.response !== undefined) {
              data.response_YN = String(data.response).toUpperCase();
            } else {
              data.response_YN = null;
            }
            data.response_type = isPO ? 'PO' : 'YN';
          }
        }
      };
      return trial;
    }

    // Build the whole experiment timeline in 6 blocks
    for (let b = 0; b < N_BLOCKS; b++) {
      const blockWords = Array.from(blocksWordSets[b]); // unique TRAIN words for this block

      // --- BLOCK HEADER ---
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p><strong>Block ${b + 1} of ${N_BLOCKS}</strong></p><p>Read each sentence carefully to understand what the Cairnish word in it means. For some, you will be asked about your understanding of what it means within the sentence. At the end of the block, you will be tested on these words. Press SPACE to begin.</p>`,
        choices: [' '],
        data: { block: b + 1, block_phase: 'start' }
      });

      // --- TRAIN: include ALL training rows for the block's words ---
      let blockTrainRows = [];
      blockWords.forEach(w => {
        const rows = wordToTrainRows[w] || [];
        blockTrainRows = blockTrainRows.concat(rows);
      });
      blockTrainRows = jsPsych.randomization.shuffle(blockTrainRows);

      // Convert to jsPsych trials (initially as space-to-continue)
      let blockTrainTrials = blockTrainRows.map(r => makeTrialFromRow(r, { blockIndex: b + 1, phase: 'train' }));

      // Randomly convert 1/3 of TRAIN trials to PLACE/OBJECT categorization
      const numPO = Math.floor(blockTrainTrials.length / 3);
      const trainIdxs = Array.from({ length: blockTrainTrials.length }, (_, i) => i);
      const idxsToPO = jsPsych.randomization.sampleWithoutReplacement(trainIdxs, numPO);

      idxsToPO.forEach(i => {
        const t = blockTrainTrials[i];
        const word = t.data.word ? String(t.data.word).trim() : '';
        t.stimulus = `<p>${t.data.sentence}</p><p><em><strong>${word}</strong>: PLACE (press P) or OBJECT (press O)?</em></p>`;
        t.choices = ['p', 'o'];
        t.data.categorization_question = true;
      });

      // --- COMPREHENSION: only for words in this block, 8 per block (if available) ---
      const COMP_PER_BLOCK = 8;
      const blockCompChosen = [];
      // round-robin across block words to pull from compByWord without repeating globally
      let wordCycle = jsPsych.randomization.shuffle(blockWords.slice());
      while (blockCompChosen.length < COMP_PER_BLOCK && wordCycle.length) {
        const w = wordCycle.shift();
        const pool = compByWord[w] || [];
        if (pool.length > 0) {
          blockCompChosen.push(pool.shift());
        }
        if (wordCycle.length === 0 && blockCompChosen.length < COMP_PER_BLOCK) {
          // restart the cycle if any comp left among these words
          wordCycle = blockWords.filter(x => (compByWord[x] && compByWord[x].length > 0));
        }
      }
      const blockCompTrials = jsPsych.randomization.shuffle(blockCompChosen)
        .map(r => makeTrialFromRow(r, { blockIndex: b + 1, phase: 'comprehension' }));

      // --- GENERALIZATION: 7 per block (no repeats across blocks) ---
      const blockGenRows = genPool.splice(0, GEN_PER_BLOCK);
      const blockGenTrials = jsPsych.randomization.shuffle(blockGenRows)
        .map(r => makeTrialFromRow(r, { blockIndex: b + 1, phase: 'generalization' }));

      // --- Push TRAIN, COMP, GEN to timeline (in that order) ---
      timeline.push({ timeline: blockTrainTrials });
      timeline.push({ timeline: blockCompTrials });
      timeline.push({ timeline: blockGenTrials });

      // --- RECAP for this block: ask P/O for each word in the block ---
      const recapTrials = jsPsych.randomization.shuffle(blockWords).map((w, i) => {
        // Use any one metadata row from this word's TRAIN set to carry fields through
        const meta = (wordToTrainRows[w] && wordToTrainRows[w][0]) ? wordToTrainRows[w][0] : {};
        // Exposures so far for this word:
        const timesExposedSoFar = runningCounts[w] || 0;

        return {
          type: jsPsychHtmlKeyboardResponse,
          stimulus: `<p><strong>${w}</strong><br><br>What does this word mean?</p>
                     <p>Press <strong>P</strong> for <strong>PLACE</strong> or <strong>O</strong> for <strong>OBJECT</strong></p>`,
          choices: ['P', 'O'],
          data: {
            presentation_order: ++globalOrder,
            block: b + 1,
            block_phase: 'recap',
            trial_tag: 'block_recap',
            participant_id: expInfo.participant_id,
            test_version: expInfo.test_version,
            session: expInfo.session,
            verb: meta.verb || null,
            word: w,
            suffix: meta.suffix || null,
            tokens: meta.tokens || null,
            meaning_abs: meta.meaning_abs || null,
            original_meaning: meta.original_meaning || null,
            meaning_item: meta.meaning_item || null,
            typicality: meta.typicality || null,
            traintest: meta.traintest || null,
            match: meta.match || null,
            type: meta.type || 'train',
            cond: meta.cond || null,
            times_exposed: timesExposedSoFar,
            categorization_question: true // so it gets saved in response_YN
          },
          on_finish: function (data) {
            data.rt_sec = data.rt ? (data.rt / 1000).toFixed(3) : null;
            if (data.response !== null && data.response !== undefined) {
              data.response_YN = String(data.response).toUpperCase();
            } else {
              data.response_YN = null;
            }
            data.response_type = 'PO';
          }
        };
      });

      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p>Quick recap for Block ${b + 1}.</p><p>Here, you will categorize the words based on what you've just learned they are. Press SPACE to start.</p>`,
        choices: [' '],
        data: { block: b + 1, block_phase: 'recap_intro' }
      });

      timeline.push({ timeline: recapTrials });

      // --- Block end screen ---
      timeline.push({
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p>End of Block ${b + 1}.</p><p>Press SPACE to continue.</p>`,
        choices: [' '],
        data: { block: b + 1, block_phase: 'end' }
      });
    }

        // === FINAL GLOBAL RECAP (all words seen) ===
    const allWordsSeen = Object.keys(runningCounts);
    const finalRecapTrials = jsPsych.randomization.shuffle(allWordsSeen).map(w => {
      const meta = (wordToTrainRows[w] && wordToTrainRows[w][0]) ? wordToTrainRows[w][0] : {};
      return {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: `<p><strong>${w}</strong><br><br>What does this word mean?</p>
                   <p>Press <strong>P</strong> for <strong>PLACE</strong> or <strong>O</strong> for <strong>OBJECT</strong></p>`,
        choices: ['P','O'],
        data: {
          block: "final",
          block_phase: "final_recap",
          word: w,
          suffix: meta.suffix || null,
          tokens: meta.tokens || null,
          meaning_abs: meta.meaning_abs || null,
          original_meaning: meta.original_meaning || null,
          meaning_item: meta.meaning_item || null,
          typicality: meta.typicality || null,
          traintest: meta.traintest || null,
          type: meta.type || 'train',
          cond: meta.cond || null,
          times_exposed: runningCounts[w],
          categorization_question: true
        },
        on_finish: d => {
          d.rt_sec = d.rt ? (d.rt/1000).toFixed(3) : null;
          d.response_YN = d.response ? String(d.response).toUpperCase() : null;
          d.response_type = 'PO';
        }
      };
    });

    timeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `<p>Final Recap</p><p>Now, we're going to go over all the Cairnish words you learned today. You are going to categorize them. Press SPACE to begin.</p>`,
      choices: [' '],
      data: { block: "final", block_phase: "final_recap_intro" }
    });

    timeline.push({ timeline: finalRecapTrials });

    

    // === Final comments, save, and exit (unchanged from your flow) ===
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
      trial_duration: 3000
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        console.log("Escape key pressed. Ending experiment...");
        jsPsych.endExperiment("You have exited the experiment early.");
      }
    });

    // Save with Pipe
    timeline.push({
      type: jsPsychPipe,
      action: 'save',
      experiment_id: "LGifwnYbcef6",
      filename: filename,
      data_string: () => {
        const data = jsPsych.data.get().csv();
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
