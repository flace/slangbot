/**
 *	Transform input string using SLANG rules: 
 *		Permute a pair of consonants in each word, checking that new letter combinations have a "melodic score" above a certain threshold.
 *		Often, just switching 1st and 2nd consonant will do the job.	
 *
 *	// TODO 
 *	// 1. Concatenate output string using input string punctuation
 *	// 2. Keep the order of uppercase-lowercase letters
 */
module.exports = text => {
  var output = '';

  // Tokenize phrase to extract only alphabet tokens
  var alphabetRegex = /[а-я]+/gi;
  //console.log('match:' + match);
  var words = text.match(alphabetRegex);
  //console.log(words);

  for (var wordIndex in words) {
    var word = words[wordIndex];
    var newWord = transformOneWord(word);
    output += newWord + ' ';	// TODO Concatenate output string using input string punctuation
  }
  return output;
};


/**
 *	Transform one single word using SLANG rules.
 */
function transformOneWord(word) {
  var wordConsonants = extractConsonants(word);
  var n = wordConsonants.length;
  // If less than 2 consonants, do nothing with the current word, just add it as is to the output.
  //		Examples: 'Не', 'оНа', 'ауЛ'.
  if (n < 2) {

    return word;

  } else {

    // Otherwise, construct all possible 2-consonant permutation candidates. Impose ORDER of candidates.
    // Example:
    //		in the word 'Александр' there are 6 consonants (encoded as 1,2,3,4,5,6 for this example), which form 15 possible permutations:
    // 		1-2, 1-3, 2-3, 1-4, 2-4, 3-4, 1-5, 2-5, 3-5, 4-5, 1-6, 2-6, 3-6, 4-6, 5-6
    // This pattern defines the order in which word has to be analyzed.
    // Often, just switching 1st and 2nd consonant will do the job. If not (the selection criteria will be described below), go to the next permutation defined by the above pattern.
    var melodicScoreThreshold = 0.005;
    for (var secondIndex = 1; secondIndex < n; secondIndex++) {
      for (var firstIndex = 0; firstIndex < secondIndex; firstIndex++) {
        // For each permutation candidate, calculate the melodic score of the word obtained after permutation is performed.
        var firstConsonant = wordConsonants[firstIndex];
        var secondConsonant = wordConsonants[secondIndex];
        //console.log('candidate permutation: '' + firstConsonant.letter + secondConsonant.letter);
        var melodicScore = calculateMelodicScore(word, firstConsonant, secondConsonant);
        //console.log('melodicScore:', melodicScore);
        // if the score is above threshold, perform permutation and return the result.
        if (melodicScore > melodicScoreThreshold) {
          return performPermutation(word, firstConsonant, secondConsonant);
        }
      }
    }

    // If all candidate permutations give low melodic scores, return input word with no changes.
    return word;
  }
}



/**
 *	Extract consonants from a word.
 *	Don't just match the whole word against the regex.
 *	Instead, use object literal with letter and its index. It will be necessary for analyzing neighbour letters.
 */
function extractConsonants(word) {
  word = word.toLowerCase();
  var wordConsonants = [];
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];
    if (isConsonant(letter)) {
      wordConsonants.push({
        letterIndex: i,
        letter: word[i]
      });
    }
  }
  return wordConsonants;
};



/**
 *	Returns true if the letter is a consonant.
 */
function isConsonant(letter) {
  var consonantsRegex = /[бвгджзйклмнпрстфхцчшщ]/gi;
  return letter.match(consonantsRegex) != null;
};



/**
 *	Calculate the melodic score of the word obtained after permutation of two consonants is performed.
 */
function calculateMelodicScore(word, firstConsonant, secondConsonant) {

	/*	Analyze letters which are situated just after two given consonants.
				Check if these consonants will form any 2-consonant pair after permutation.

				Example 1: 'аЛеКсандр'
					permuatation of 'Л' and 'К' gives 'аКеЛсандр', where the letter 'К' doesn't form any 2-consonant pair, while 'Л' does: pair 'Лс'.

				Example 2: 'ПриВет'
					permutation of 'П' and 'В' gives 'ВриПет', where the letter 'В' forms a 2-consonant pair 'Вр', while 'П' forms no pairs.

				Example 3: 'КоМанда'
					permutation of 'К' and 'М' gives 'МоКанда', creating no new 2-consonant pairs.	*/
  var i = firstConsonant.letterIndex;
  var j = secondConsonant.letterIndex;

  var potentialNewWord = performPermutation(word, firstConsonant, secondConsonant).toLowerCase();
  //console.log('potentialNewWord: '' + potentialNewWord);

  var pairsToCheckForSounding = [];
  var L = potentialNewWord.length;
  // Neighbours of the 1st consonant, which are to be checked with the 2nd consonant after permutation
  if (i - 1 >= 0 && isConsonant(potentialNewWord[i - 1])) {
    pairsToCheckForSounding.push(potentialNewWord[i - 1] + secondConsonant.letter);
  }
  if (i + 1 < L && isConsonant(potentialNewWord[i + 1])) {
    pairsToCheckForSounding.push(secondConsonant.letter + potentialNewWord[i + 1]);
  }
  // Neighbours of the 2nd consonant, which are to be checked with the 1st consonant after permutation
  if (j - 1 >= 0 && isConsonant(potentialNewWord[j - 1])) {
    pairsToCheckForSounding.push(potentialNewWord[j - 1] + firstConsonant.letter);
  }
  if (j + 1 < L && isConsonant(potentialNewWord[j + 1])) {
    pairsToCheckForSounding.push(firstConsonant.letter + potentialNewWord[j + 1]);
  }

  // If no new 2-consonant pairs are created (like in example 3), return the maximum score (1.0) to indicate that permutation is possible.
  if (pairsToCheckForSounding.length == 0) {
    return 1.0;
  } else {
    // Otherwise, for each of the created 2-consonant pairs, add its MELODIOUSNESS score from the 2-consonant table.
    var scores = [];
    for (var pairIndex in pairsToCheckForSounding) {
      var pair = pairsToCheckForSounding[pairIndex];
      var score = twoConsonantScores[pair];
      //console.log(pair + ': score = '' + score);
      scores.push(score);
    }
    // return the minimum score.
    return Math.min.apply(null, scores);
  }

};



/**
 *	Perform permutation of given consonants in the given word.
 */
var performPermutation = function (word, firstConsonant, secondConsonant) {
  // TODO  Keep the order of uppercase-lowercase letters
  var i = firstConsonant.letterIndex;
  var j = secondConsonant.letterIndex;
  return word.slice(0, i) + word[j] + word.slice(i + 1, j) + word[i] + word.slice(j + 1, word.length);
};


/**
 * Melodic scores of 2-consonants combination.
 */
var twoConsonantScores = {
  'ст': 0.10823330515638208,
  'пр': 0.06278951817413356,
  'нн': 0.03314266929651545,
  'ск': 0.028186343570958956,
  'тс': 0.02108763031839955,
  'сл': 0.02083028083028083,
  'тр': 0.018909551986475065,
  'тв': 0.018868225791302713,
  'нт': 0.016862026862026862,
  'сс': 0.01667887667887668,
  'вл': 0.016412134873673337,
  'дн': 0.01620174697097774,
  'сп': 0.01604207758053912,
  'гр': 0.015545224006762469,
  'нс': 0.014337372029679721,
  'бр': 0.013823612285150748,
  'вн': 0.013683666760589838,
  'кр': 0.013645158260542876,
  'вс': 0.013453554992016531,
  'кт': 0.01280548511317742,
  'св': 0.012039072039072039,
  'зн': 0.011950784258476566,
  'рн': 0.01141354372123603,
  'зв': 0.011238846623462008,
  'рт': 0.01068282145205222,
  'сн': 0.010199117122194045,
  'чн': 0.010077956231802385,
  'вр': 0.009669390438621207,
  'йс': 0.009570771109232648,
  'чт': 0.009358504743120128,
  'нд': 0.009194139194139195,
  'бл': 0.009072039072039071,
  'рс': 0.008959331267023574,
  'дл': 0.008814689583920354,
  'зд': 0.008502864656710811,
  'тн': 0.008360101437024514,
  'пл': 0.007709213863060017,
  'жд': 0.0075626937165398705,
  'рм': 0.007524185216492909,
  'др': 0.007466892082276698,
  'жн': 0.007086503240349394,
  'дс': 0.00670987132525594,
  'нц': 0.006608434300741993,
  'дв': 0.006564290410444256,
  'кл': 0.006524842678688833,
  'рв': 0.006256222410068564,
  'гл': 0.006146332300178454,
  'мн': 0.006044895275664507,
  'мп': 0.005781910397295012,
  'нк': 0.0056776556776556774,
  'рг': 0.005570583262890955,
  'лс': 0.005557434018972481,
  'кс': 0.0053235653235653236,
  'тк': 0.0049751103597257445,
  'лл': 0.004966657274349582,
  'см': 0.004899971823048746,
  'ср': 0.004891518737672584,
  'зм': 0.0048135625058701986,
  'йн': 0.0045224006762468304,
  'вш': 0.004508312200619893,
  'гд': 0.004435991359068282,
  'рк': 0.004365548980933596,
  'нг': 0.004358035127265896,
  'вт': 0.004091293322062553,
  'лн': 0.003800131492439185,
  'вк': 0.0037916784070630223,
  'рд': 0.003438527284681131,
  'рж': 0.003324880247957171,
  'зр': 0.003319244857706396,
  'кж': 0.003316427162581009,
  'лк': 0.003287310979618672,
  'бщ': 0.003159575467267775,
  'фр': 0.003143608528223913,
  'бн': 0.0029839391377852915,
  'пп': 0.0028543251620174698,
  'мм': 0.00285056823518362,
  'шк': 0.0028261482107635955,
  'шл': 0.002773551235089697,
  'хр': 0.0027275288813750354,
  'дж': 0.002666478820324974,
  'рх': 0.002664600356908049,
  'лж': 0.0023386869540715696,
  'сч': 0.0023208415516107824,
  'рш': 0.002249459941767634,
  'нч': 0.0022203437588052973,
  'кн': 0.002215647600262985,
  'рр': 0.00220249835634451,
  'зл': 0.0021799567953414106,
  'шн': 0.002172442941673711,
  'дк': 0.0021151498074575,
  'мл': 0.002105757490372875,
  'сх': 0.0020559782098243636,
  'тл': 0.002035315112238189,
  'бс': 0.0019770827463135156,
  'йт': 0.0018897341974265052,
  'вм': 0.001814595660749507,
  'кц': 0.001753545599699446,
  'чк': 0.0017469709777402085,
  'сш': 0.0017413355874894337,
  'дп': 0.001726307880154034,
  'рб': 0.0016896778435239973,
  'рл': 0.0016492908800601108,
  'мс': 0.0016267493190570113,
  'вп': 0.001592936977552362,
  'вз': 0.0015844838921762,
  'цк': 0.0015685169531323376,
  'пн': 0.001496196111580727,
  'гн': 0.0014839860993707149,
  'нф': 0.0014595660749506904,
  'тд': 0.0014445383676152906,
  'мб': 0.0013806706114398422,
  'зб': 0.0013722175260636798,
  'зг': 0.0013618859772705928,
  'кв': 0.001350615196769043,
  'тч': 0.0013261951723490186,
  'рп': 0.0013261951723490186,
  'йш': 0.001307410538179769,
  'хн': 0.0012952005259697567,
  'пт': 0.0012576312576312576,
  'км': 0.0012463604771297079,
  'зк': 0.0011984596599981215,
  'шт': 0.0011862496477881093,
  'лг': 0.0011702827087442472,
  'дд': 0.0011684042453273223,
  'дм': 0.0011608903916596224,
  'тт': 0.0011543157697003852,
  'йк': 0.0011298957452803608,
  'сб': 0.0010942049403587866,
  'сд': 0.0010866910866910867,
  'мк': 0.001071663379355687,
  'тм': 0.0010594533671456749,
  'фл': 0.0010350333427256505,
  'нв': 0.001030337184183338,
  'чл': 0.0009636517328825021,
  'пс': 0.0009598948060486522,
  'вг': 0.0009533201840894148,
  'йд': 0.0009345355499201653,
  'сц': 0.000924204001127078,
  'вв': 0.0009176293791678407,
  'цв': 0.0008734854888701042,
  'фф': 0.0008669108669108669,
  'чш': 0.0008556400864093172,
  'рц': 0.00084155161078238,
  'хв': 0.0008387339156569925,
  'вд': 0.0008321592936977552,
  'рч': 0.0008190100497792805,
  'лд': 0.0008086785009861932,
  'лт': 0.0008058608058608059,
  'бх': 0.0007880154034000188,
  'хс': 0.0007635953789799944,
  'рф': 0.0007626561472715319,
  'вх': 0.000757020757020757,
  'сф': 0.0007542030618953696,
  'кк': 0.0007297830374753452,
  'тп': 0.0006856391471776087,
  'тб': 0.0006800037569268338,
  'йц': 0.0006715506715506716,
  'йл': 0.0006677937447168216,
  'гг': 0.0006659152812998967,
  'дш': 0.0006574621959237344,
  'нз': 0.0006537052690898845,
  'щн': 0.0006499483422560345,
  'зс': 0.0006321029397952475,
  'нщ': 0.0006198929275852353,
  'йм': 0.0006133183056259979,
  'мв': 0.0005964121348736734,
  'бк': 0.0005964121348736734,
  'зж': 0.000589837512914436,
  'нр': 0.0005832628909551987,
  'гк': 0.000568235183619799,
  'дц': 0.0005419366957828497,
  'жб': 0.0005363013055320748,
  'дз': 0.0005128205128205128,
  'дч': 0.0005006105006105006,
  'дг': 0.0004902789518174133,
  'тц': 0.00047806893960740117,
  'шв': 0.00047712970789893865,
  'хл': 0.0004724335493566263,
  'фт': 0.0004564666103127642,
  'пк': 0.00045177045177045177,
  'нж': 0.00045177045177045177,
  'чр': 0.00043956043956043956,
  'жс': 0.00043204658589273976,
  'йч': 0.0004282896590588898,
  'хт': 0.00041983657368272755,
  'жк': 0.00040950502488964027,
  'фс': 0.00039353808584577816,
  'дт': 0.0003925988541373157,
  'бв': 0.0003907203907203907,
  'кз': 0.0003869634638865408,
  'йб': 0.0003860242321780783,
  'нб': 0.00035596881750727907,
  'лм': 0.00035502958579881655,
  'гв': 0.0003484549638395792,
  'хм': 0.0003446980370057293,
  'вц': 0.0003240349394195548,
  'дх': 0.00030900723208415515,
  'бм': 0.00029679721987414294,
  'гм': 0.0002939795247487555,
  'мц': 0.00029304029304029304,
  'мф': 0.0002780125857048934,
  'нх': 0.0002742556588710435,
  'бб': 0.00027331642716258103,
  'дб': 0.00027331642716258103,
  'йр': 0.0002648633417864187,
  'жч': 0.00026298487836949375,
  'тф': 0.0002611064149525688,
  'пц': 0.00025547102470179395,
  'мг': 0.00024138254907485676,
  'лб': 0.00022541561003099465,
  'кг': 0.00021978021978021978,
  'рз': 0.0002141448295294449,
  'вщ': 0.00021226636611251996,
  'йв': 0.000210387902695595,
  'нл': 0.00020663097586174508,
  'йз': 0.0002019348173194327,
  'бш': 0.0002019348173194327,
  'мр': 0.0001972386587771203,
  'кп': 0.00019442096365173287,
  'нш': 0.00019066403681788297,
  'лч': 0.00019066403681788297,
  'лп': 0.0001859678782755706,
  'шп': 0.00018408941485864564,
  'гс': 0.0001803324880247957,
  'вч': 0.00017939325631633325,
  'тх': 0.00017187940264863343,
  'зц': 0.00017094017094017094,
  'лх': 0.00016342631727247112,
  'бж': 0.00015873015873015873,
  'сг': 0.0001521555367709214,
  'чв': 0.00014464168310322157,
  'цз': 0.00013994552456090918,
  'чж': 0.0001390062928524467,
  'шс': 0.0001343101343101343,
  'нп': 0.00012679628064243449,
  'кш': 0.00012491781722550954,
  'лф': 0.00012397858551704705,
  'бд': 0.00012022165868319715,
  'йх': 0.00012022165868319715,
  'гч': 0.00011646473184934724,
  'шр': 0.00011646473184934724,
  'мч': 0.00011646473184934724,
  'бт': 0.00010989010989010989,
  'йф': 0.00010895087818164742,
  'зз': 0.0001051939513477975,
  'йг': 0.00010425471963933503,
  'пч': 0.00010143702451394759,
  'вб': 0.00010049779280548512,
  'бз': 9.861932938856015e-05,
  'лв': 9.580163426317273e-05,
  'лщ': 9.580163426317273e-05,
  'сж': 9.486240255471024e-05,
  'шм': 9.486240255471024e-05,
  'йп': 9.29839391377853e-05,
  'зч': 9.204470742932282e-05,
  'тз': 9.204470742932282e-05,
  'тг': 9.110547572086033e-05,
  'кб': 9.110547572086033e-05,
  'лш': 9.110547572086033e-05,
  'рщ': 8.547008547008547e-05,
  'фг': 8.077392692777308e-05,
  'фн': 7.701700009392317e-05,
  'кх': 7.419930496853573e-05,
  'мт': 7.232084155161079e-05,
  'тщ': 6.856391471776087e-05,
  'пш': 6.856391471776087e-05,
  'гт': 6.76246830092984e-05,
  'жж': 6.76246830092984e-05,
  'цс': 6.668545130083591e-05,
  'нм': 6.668545130083591e-05,
  'жр': 6.386775617544849e-05,
  'кд': 6.198929275852352e-05,
  'лз': 6.198929275852352e-05,
  'цц': 6.0110829341598575e-05,
  'мз': 5.9171597633136094e-05,
  'фм': 5.6353902507748664e-05,
  'чч': 5.541467079928618e-05,
  'мх': 5.447543909082371e-05,
  'жг': 5.3536207382361226e-05,
  'тш': 5.259697567389875e-05,
  'чм': 4.7900817131586365e-05,
  'чс': 4.508312200619893e-05,
  'бг': 4.4143890297736454e-05,
  'бц': 4.4143890297736454e-05,
  'бч': 4.320465858927397e-05,
  'хк': 4.22654268808115e-05,
  'мд': 4.22654268808115e-05,
  'шц': 4.22654268808115e-05,
  'фк': 4.1326195172349016e-05,
  'пф': 4.1326195172349016e-05,
  'зп': 4.038696346388654e-05,
  'хх': 4.038696346388654e-05,
  'гб': 3.944773175542406e-05,
  'хг': 3.8508500046961586e-05,
  'щр': 3.8508500046961586e-05,
  'цд': 3.7569268338499105e-05,
  'зш': 3.663003663003663e-05,
  'сз': 3.5690804921574155e-05,
  'пв': 3.4751573213111674e-05,
  'цн': 3.4751573213111674e-05,
  'пг': 3.1933878087724244e-05,
  'хд': 3.1933878087724244e-05,
  'дф': 3.099464637926176e-05,
  'хп': 3.0055414670799288e-05,
  'хч': 2.8176951253874332e-05,
  'цр': 2.8176951253874332e-05,
  'зт': 2.8176951253874332e-05,
  'кф': 2.6298487836949376e-05,
  'жм': 2.6298487836949376e-05,
  'хш': 2.5359256128486898e-05,
  'пд': 2.5359256128486898e-05,
  'гш': 2.5359256128486898e-05,
  'гп': 2.442002442002442e-05,
  'жц': 2.442002442002442e-05,
  'кч': 2.442002442002442e-05,
  'лр': 2.3480792711561942e-05,
  'цм': 2.2541561003099464e-05,
  'бп': 2.2541561003099464e-05,
  'цт': 2.2541561003099464e-05,
  'пм': 2.2541561003099464e-05,
  'чх': 2.1602329294636986e-05,
  'пх': 2.0663097586174508e-05,
  'жп': 2.0663097586174508e-05,
  'шх': 2.0663097586174508e-05,
  'жл': 1.972386587771203e-05,
  'вф': 1.8784634169249552e-05,
  'фб': 1.8784634169249552e-05,
  'хз': 1.7845402460787078e-05,
  'цп': 1.7845402460787078e-05,
  'фз': 1.7845402460787078e-05,
  'гх': 1.7845402460787078e-05,
  'лц': 1.7845402460787078e-05,
  'хц': 1.69061707523246e-05,
  'пб': 1.69061707523246e-05,
  'гц': 1.69061707523246e-05,
  'мщ': 1.69061707523246e-05,
  'жв': 1.5966939043862122e-05,
  'мш': 1.5966939043862122e-05,
  'цл': 1.5966939043862122e-05,
  'хб': 1.5966939043862122e-05,
  'вж': 1.5027707335399644e-05,
  'пз': 1.4088475626937166e-05,
  'мж': 1.4088475626937166e-05,
  'цг': 1.4088475626937166e-05,
  'цх': 1.3149243918474688e-05,
  'шш': 1.3149243918474688e-05,
  'жз': 1.3149243918474688e-05,
  'йщ': 1.3149243918474688e-05,
  'фш': 1.3149243918474688e-05,
  'сщ': 1.221001221001221e-05,
  'гф': 1.221001221001221e-05,
  'чп': 1.1270780501549732e-05,
  'шг': 1.0331548793087254e-05,
  'хф': 1.0331548793087254e-05,
  'гз': 1.0331548793087254e-05,
  'цб': 9.392317084624776e-06,
  'фд': 8.4530853761623e-06,
  'цш': 8.4530853761623e-06,
  'шб': 8.4530853761623e-06,
  'жт': 6.574621959237344e-06,
  'чф': 6.574621959237344e-06,
  'шф': 6.574621959237344e-06,
  'зх': 6.574621959237344e-06,
  'гж': 6.574621959237344e-06,
  'бф': 6.574621959237344e-06,
  'тж': 5.635390250774866e-06,
  'пщ': 5.635390250774866e-06,
  'зф': 5.635390250774866e-06,
  'фх': 4.696158542312388e-06,
  'жф': 4.696158542312388e-06,
  'шд': 4.696158542312388e-06,
  'чд': 4.696158542312388e-06,
  'цч': 3.756926833849911e-06,
  'фп': 3.756926833849911e-06,
  'шч': 2.817695125387433e-06,
  'фв': 2.817695125387433e-06,
  'нй': 2.817695125387433e-06,
  'чз': 2.817695125387433e-06,
  'чг': 2.817695125387433e-06,
  'цф': 2.817695125387433e-06,
  'жш': 1.8784634169249555e-06,
  'мй': 1.8784634169249555e-06,
  'дщ': 1.8784634169249555e-06,
  'хж': 1.8784634169249555e-06,
  'вй': 1.8784634169249555e-06,
  'кй': 1.8784634169249555e-06,
  'йж': 1.8784634169249555e-06,
  'фч': 9.392317084624777e-07,
  'фц': 9.392317084624777e-07,
  'шз': 9.392317084624777e-07,
  'щс': 9.392317084624777e-07,
  'щш': 9.392317084624777e-07,
  'сй': 9.392317084624777e-07,
  'дй': 9.392317084624777e-07,
  'лй': 9.392317084624777e-07,
  'йй': 9.392317084624777e-07,
  'щф': 9.392317084624777e-07,
  'кщ': 9.392317084624777e-07,
  'щв': 9.392317084624777e-07,
  'щз': 9.392317084624777e-07,
  'зщ': 9.392317084624777e-07,
  'чб': 9.392317084624777e-07,
  'рй': 9.392317084624777e-07
};