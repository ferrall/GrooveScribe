/**
 * GrooveScribe Drum Sound Test Suite
 * Run this script in the browser console on the GrooveScribe page
 * to test all drum sounds and MIDI mappings
 */

(function() {
    'use strict';

    // Define all drum notes used in GrooveScribe (corrected MIDI mappings)
    const DRUM_NOTES = {
        // Kick drum
        'Kick Normal': { midi: 35, constant: 'constant_OUR_MIDI_KICK_NORMAL' },
        'Hi-hat Foot': { midi: 44, constant: 'constant_OUR_MIDI_HIHAT_FOOT' },
        
        // Snare drum  
        'Snare Normal': { midi: 38, constant: 'constant_OUR_MIDI_SNARE_NORMAL' },
        'Snare Accent': { midi: 22, constant: 'constant_OUR_MIDI_SNARE_ACCENT' },
        'Snare Ghost': { midi: 21, constant: 'constant_OUR_MIDI_SNARE_GHOST' },
        'Cross Stick': { midi: 37, constant: 'constant_OUR_MIDI_SNARE_XSTICK' },
        
        // Hi-hat
        'Hi-hat Normal': { midi: 42, constant: 'constant_OUR_MIDI_HIHAT_NORMAL' },
        'Hi-hat Open': { midi: 46, constant: 'constant_OUR_MIDI_HIHAT_OPEN' },
        
        // Toms
        'Tom 1 Normal': { midi: 48, constant: 'constant_OUR_MIDI_TOM1_NORMAL' },
        'Tom 2 Normal': { midi: 47, constant: 'constant_OUR_MIDI_TOM2_NORMAL' },
        'Tom 3 Normal': { midi: 45, constant: 'constant_OUR_MIDI_TOM3_NORMAL' },
        'Tom 4 Normal': { midi: 43, constant: 'constant_OUR_MIDI_TOM4_NORMAL' },
        
        // Cymbals
        'Crash': { midi: 49, constant: 'constant_OUR_MIDI_CRASH' },
        'Ride': { midi: 51, constant: 'constant_OUR_MIDI_RIDE' },
        'Ride Bell': { midi: 53, constant: 'constant_OUR_MIDI_RIDE_BELL' },
        
        // Metronome
        'Metronome Normal': { midi: 76, constant: 'constant_OUR_MIDI_METRONOME_NORMAL' },
        'Metronome Accent': { midi: 77, constant: 'constant_OUR_MIDI_METRONOME_ACCENT' }
    };

    const TestResults = {
        system: {},
        midi: {},
        functions: {},
        summary: { total: 0, passed: 0, failed: 0, warnings: 0 }
    };

    // Styling for console output
    const styles = {
        header: 'color: #2484C0; font-size: 18px; font-weight: bold; background: #f0f8ff; padding: 5px;',
        pass: 'color: #155724; background: #d4edda; padding: 2px;',
        fail: 'color: #721c24; background: #f8d7da; padding: 2px;',
        warning: 'color: #856404; background: #fff3cd; padding: 2px;',
        info: 'color: #0c5460; background: #d1ecf1; padding: 2px;',
        section: 'color: #495057; font-weight: bold; font-size: 14px;'
    };

    function log(message, style = '') {
        if (style) {
            console.log(`%c${message}`, style);
        } else {
            console.log(message);
        }
    }

    function logPass(message) {
        log(`✅ ${message}`, styles.pass);
    }

    function logFail(message) {
        log(`❌ ${message}`, styles.fail);
    }

    function logWarning(message) {
        log(`⚠️ ${message}`, styles.warning);
    }

    function logInfo(message) {
        log(`ℹ️ ${message}`, styles.info);
    }

    function logSection(message) {
        log(`\n🔧 ${message}`, styles.section);
    }

    // System check functions
    function runSystemCheck() {
        logSection('SYSTEM CHECK');
        
        const checks = [
            {
                name: 'MIDI.js Libraries',
                test: () => typeof MIDI !== 'undefined' && typeof MIDI.WebAudio !== 'undefined',
                description: 'MIDI.js libraries loaded'
            },
            {
                name: 'MIDI WebAudio Plugin',
                test: () => MIDI.WebAudio && typeof MIDI.WebAudio.noteOn === 'function',
                description: 'MIDI WebAudio plugin available'
            },
            {
                name: 'Audio Context',
                test: () => {
                    try {
                        return !!(window.AudioContext || window.webkitAudioContext);
                    } catch (e) {
                        return false;
                    }
                },
                description: 'Browser audio context support'
            },
            {
                name: 'Groove Utils',
                test: () => typeof window.constant_OUR_MIDI_KICK_NORMAL !== 'undefined',
                description: 'GrooveScribe utilities loaded'
            },
            {
                name: 'Soundfont Functions',
                test: () => typeof getMidiSoundFontLocation === 'function',
                description: 'Soundfont location function available'
            }
        ];

        let systemPassed = 0;
        let systemTotal = checks.length;

        checks.forEach(check => {
            const passed = check.test();
            TestResults.system[check.name] = passed;
            
            if (passed) {
                logPass(`${check.name}: ${check.description}`);
                systemPassed++;
            } else {
                logFail(`${check.name}: ${check.description}`);
            }
        });

        logInfo(`System Check: ${systemPassed}/${systemTotal} passed`);
        return systemPassed === systemTotal;
    }

    // MIDI note testing
    function runMIDITests() {
        logSection('MIDI NOTE TESTS');
        
        if (!MIDI || !MIDI.WebAudio || typeof MIDI.WebAudio.noteOn !== 'function') {
            logFail('MIDI system not available - skipping MIDI tests');
            return false;
        }

        let midiPassed = 0;
        let midiTotal = Object.keys(DRUM_NOTES).length;
        const failedNotes = [];
        const workingNotes = [];

        for (const [noteName, noteInfo] of Object.entries(DRUM_NOTES)) {
            try {
                const audioNode = MIDI.WebAudio.noteOn(9, noteInfo.midi, 100, 0);
                
                if (audioNode && typeof audioNode === 'object') {
                    logPass(`${noteName} (MIDI ${noteInfo.midi}): Working`);
                    TestResults.midi[noteName] = true;
                    workingNotes.push(noteName);
                    midiPassed++;
                } else {
                    logFail(`${noteName} (MIDI ${noteInfo.midi}): No sound data (returns ${typeof audioNode})`);
                    TestResults.midi[noteName] = false;
                    failedNotes.push(noteName);
                }
            } catch (error) {
                logFail(`${noteName} (MIDI ${noteInfo.midi}): Error - ${error.message}`);
                TestResults.midi[noteName] = false;
                failedNotes.push(noteName);
            }
        }

        logInfo(`MIDI Tests: ${midiPassed}/${midiTotal} passed`);
        
        if (failedNotes.length > 0) {
            logWarning(`Failed notes: ${failedNotes.join(', ')}`);
        }

        return midiPassed === midiTotal;
    }

    // Test GrooveScribe functions
    function runGrooveScribeFunctionTests() {
        logSection('GROOVESCRIBE FUNCTION TESTS');
        
        const functionTests = [
            {
                name: 'play_single_note_for_note_setting',
                test: () => typeof play_single_note_for_note_setting === 'function',
                description: 'Main note playing function'
            },
            {
                name: 'MIDI Constants',
                test: () => {
                    const constants = [
                        'constant_OUR_MIDI_KICK_NORMAL',
                        'constant_OUR_MIDI_SNARE_NORMAL', 
                        'constant_OUR_MIDI_TOM1_NORMAL',
                        'constant_OUR_MIDI_TOM2_NORMAL',
                        'constant_OUR_MIDI_TOM3_NORMAL',
                        'constant_OUR_MIDI_TOM4_NORMAL'
                    ];
                    return constants.every(constant => typeof window[constant] !== 'undefined');
                },
                description: 'All MIDI constants defined'
            },
            {
                name: 'Tom Functions',
                test: () => {
                    return typeof set_tom1_state === 'function' &&
                           typeof set_tom2_state === 'function' &&
                           typeof set_tom_state === 'function';
                },
                description: 'Tom control functions'
            },
            {
                name: 'Drum State Functions',
                test: () => {
                    return typeof set_kick_state === 'function' &&
                           typeof set_snare_state === 'function' &&
                           typeof set_hihat_state === 'function';
                },
                description: 'Drum state control functions'
            }
        ];

        let functionsPassed = 0;
        let functionsTotal = functionTests.length;

        functionTests.forEach(test => {
            const passed = test.test();
            TestResults.functions[test.name] = passed;
            
            if (passed) {
                logPass(`${test.name}: ${test.description}`);
                functionsPassed++;
            } else {
                logFail(`${test.name}: ${test.description}`);
            }
        });

        // Test actual tom2 function call (the one that was broken)
        if (typeof set_tom2_state === 'function') {
            try {
                set_tom2_state('test', 'normal', false); // Test without sound
                logPass('set_tom2_state function call: Working');
                TestResults.functions['set_tom2_state call'] = true;
                functionsPassed++;
            } catch (error) {
                logFail(`set_tom2_state function call: Error - ${error.message}`);
                TestResults.functions['set_tom2_state call'] = false;
            }
            functionsTotal++;
        }

        logInfo(`Function Tests: ${functionsPassed}/${functionsTotal} passed`);
        return functionsPassed === functionsTotal;
    }

    // Test specific problematic toms
    function testProblematicToms() {
        logSection('PROBLEMATIC TOM TESTS');
        
        const problematicToms = [
            { name: 'Tom 2', midi: 47 },
            { name: 'Tom 3', midi: 45 }
        ];

        problematicToms.forEach(tom => {
            try {
                const result = MIDI.WebAudio.noteOn(9, tom.midi, 100, 0);
                if (result && typeof result === 'object') {
                    logPass(`${tom.name} (MIDI ${tom.midi}): FIXED - Now working!`);
                } else {
                    logFail(`${tom.name} (MIDI ${tom.midi}): Still broken - returns ${typeof result}`);
                }
            } catch (error) {
                logFail(`${tom.name} (MIDI ${tom.midi}): Error - ${error.message}`);
            }
        });
    }

    // Generate summary
    function generateSummary() {
        logSection('TEST SUMMARY');
        
        let totalTests = 0;
        let passedTests = 0;
        
        // Count all test results
        Object.values(TestResults.system).forEach(result => {
            totalTests++;
            if (result) passedTests++;
        });
        
        Object.values(TestResults.midi).forEach(result => {
            totalTests++;
            if (result) passedTests++;
        });
        
        Object.values(TestResults.functions).forEach(result => {
            totalTests++;
            if (result) passedTests++;
        });

        const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        const failedTests = totalTests - passedTests;

        log('\n📊 FINAL RESULTS', styles.header);
        logInfo(`Total Tests: ${totalTests}`);
        logInfo(`Passed: ${passedTests}`);
        logInfo(`Failed: ${failedTests}`);
        logInfo(`Success Rate: ${successRate}%`);

        if (successRate === 100) {
            logPass('🎉 ALL TESTS PASSED! GrooveScribe drum sounds are working perfectly.');
        } else if (successRate >= 90) {
            logWarning(`⚠️ Most tests passed (${successRate}%), but some minor issues detected.`);
        } else if (successRate >= 70) {
            logWarning(`⚠️ Moderate issues detected (${successRate}% passed). Some drum sounds may not work.`);
        } else {
            logFail(`❌ Significant issues detected (${successRate}% passed). GrooveScribe may not function properly.`);
        }

        // List failed MIDI notes
        const failedMidi = Object.entries(TestResults.midi).filter(([name, result]) => !result);
        if (failedMidi.length > 0) {
            logFail(`Failed MIDI notes: ${failedMidi.map(([name]) => name).join(', ')}`);
        }

        // List failed functions
        const failedFunctions = Object.entries(TestResults.functions).filter(([name, result]) => !result);
        if (failedFunctions.length > 0) {
            logFail(`Failed functions: ${failedFunctions.map(([name]) => name).join(', ')}`);
        }

        return { successRate, totalTests, passedTests, failedTests };
    }

    // Main test runner
    function runAllTests() {
        log('🥁 GROOVESCRIBE DRUM SOUND TEST SUITE', styles.header);
        log('Testing all drum sounds and MIDI mappings...\n');

        const systemOk = runSystemCheck();
        if (!systemOk) {
            logFail('System check failed - some tests may not run properly');
        }

        const midiOk = runMIDITests();
        const functionsOk = runGrooveScribeFunctionTests();
        
        testProblematicToms();
        
        const summary = generateSummary();
        
        // Return results for programmatic access
        return {
            success: summary.successRate === 100,
            summary,
            results: TestResults
        };
    }

    // Quick test function for specific notes
    function quickTestNote(midiNote, noteName) {
        try {
            const result = MIDI.WebAudio.noteOn(9, midiNote, 100, 0);
            if (result && typeof result === 'object') {
                logPass(`${noteName || 'MIDI ' + midiNote}: Working`);
                return true;
            } else {
                logFail(`${noteName || 'MIDI ' + midiNote}: Not working (returns ${typeof result})`);
                return false;
            }
        } catch (error) {
            logFail(`${noteName || 'MIDI ' + midiNote}: Error - ${error.message}`);
            return false;
        }
    }

    // Play a specific note for testing
    function playNote(midiNote, noteName) {
        try {
            MIDI.WebAudio.noteOn(9, midiNote, 100, 0);
            logInfo(`Playing ${noteName || 'MIDI ' + midiNote}`);
        } catch (error) {
            logFail(`Error playing ${noteName || 'MIDI ' + midiNote}: ${error.message}`);
        }
    }

    // Export functions to global scope for easy console access
    window.DrumSoundTest = {
        runAllTests,
        runSystemCheck,
        runMIDITests,
        runGrooveScribeFunctionTests,
        testProblematicToms,
        quickTestNote,
        playNote,
        DRUM_NOTES
    };

    // Auto-run if script is executed directly
    if (typeof window !== 'undefined' && window.location) {
        log('🎵 Drum Sound Test Suite loaded!', styles.info);
        log('Run DrumSoundTest.runAllTests() to test all drum sounds', styles.info);
        log('Run DrumSoundTest.quickTestNote(47, "Tom 2") to test specific notes', styles.info);
        log('Run DrumSoundTest.playNote(47, "Tom 2") to play specific notes', styles.info);
    }

    return window.DrumSoundTest;
})(); 