// Quick Drum Sound Test - Tests all major drum sounds with correct MIDI mappings
// Based on actual GrooveScribe constants from groove_utils.js

(function() {
    console.log('🥁 Quick Drum Sound Test');
    console.log('========================');

    // 🔍 System Check
    console.log('🔍 System Check:');
    if (typeof MIDI === 'undefined') {
        console.log('❌ MIDI.js not loaded!');
        return { error: 'MIDI.js not loaded', working: 0, broken: 16, total: 16, success: false };
    }
    
    if (!MIDI.WebAudio) {
        console.log('❌ MIDI.WebAudio not available!');
        return { error: 'MIDI.WebAudio not available', working: 0, broken: 16, total: 16, success: false };
    }
    
    console.log('✅ MIDI.js loaded');
    console.log('✅ MIDI.WebAudio available');
    console.log('');

    // Correct MIDI mappings from GrooveScribe constants
    const drumTests = [
        { name: 'Kick', midi: 35, note: 'constant_OUR_MIDI_KICK_NORMAL' },
        { name: 'Snare Normal', midi: 38, note: 'constant_OUR_MIDI_SNARE_NORMAL' },
        { name: 'Snare Ghost', midi: 21, note: 'constant_OUR_MIDI_SNARE_GHOST' },
        { name: 'Snare Accent', midi: 22, note: 'constant_OUR_MIDI_SNARE_ACCENT' },
        { name: 'Cross Stick', midi: 37, note: 'constant_OUR_MIDI_SNARE_XSTICK' },
        { name: 'Hi-hat', midi: 42, note: 'constant_OUR_MIDI_HIHAT_NORMAL' },
        { name: 'Hi-hat Open', midi: 46, note: 'constant_OUR_MIDI_HIHAT_OPEN' },
        { name: 'Hi-hat Foot', midi: 44, note: 'constant_OUR_MIDI_HIHAT_FOOT' },
        { name: 'Tom 1 (High Tom)', midi: 48, note: 'constant_OUR_MIDI_TOM1_NORMAL' },
        { name: 'Tom 2 (Mid Tom)', midi: 47, note: 'constant_OUR_MIDI_TOM2_NORMAL' },
        { name: 'Tom 3 (Low Tom)', midi: 45, note: 'constant_OUR_MIDI_TOM3_NORMAL' },
        { name: 'Tom 4 (Floor Tom)', midi: 43, note: 'constant_OUR_MIDI_TOM4_NORMAL' },
        { name: 'Crash', midi: 49, note: 'constant_OUR_MIDI_CRASH_NORMAL' },
        { name: 'Ride', midi: 51, note: 'constant_OUR_MIDI_RIDE_NORMAL' },
        { name: 'Ride Bell', midi: 53, note: 'constant_OUR_MIDI_RIDE_BELL' },
        { name: 'Metronome', midi: 77, note: 'constant_OUR_MIDI_METRONOME' }
    ];

    let working = 0;
    let broken = 0;
    const brokenDrums = [];

    // Test each drum sound
    for (const drum of drumTests) {
        try {
            const result = MIDI.WebAudio.noteOn(9, drum.midi, 100, 0);
            if (result && result !== undefined) {
                console.log(`✅ ${drum.name} (${drum.midi}): Working`);
                working++;
            } else {
                console.log(`❌ ${drum.name} (${drum.midi}): Broken`);
                broken++;
                brokenDrums.push(drum.name);
            }
        } catch (error) {
            console.log(`❌ ${drum.name} (${drum.midi}): Error - ${error.message}`);
            broken++;
            brokenDrums.push(drum.name);
        }
    }

    const total = working + broken;
    const percentage = Math.round((working / total) * 100);

    console.log('========================');
    console.log(`📊 Results: ${working}/${total} working (${percentage}%)`);
    
    if (working === total) {
        console.log('🎉 All drum sounds are working!');
    } else {
        console.log(`❌ Broken: ${brokenDrums.join(', ')}`);
    }

    // Special focus on previously problematic toms
    console.log('\n🔍 Testing Previously Problematic Toms:');
    const problemToms = [
        { name: 'Tom 2 (Mid Tom)', midi: 47 },
        { name: 'Tom 3 (Low Tom)', midi: 45 }
    ];

    for (const tom of problemToms) {
        try {
            const result = MIDI.WebAudio.noteOn(9, tom.midi, 100, 0);
            if (result && result !== undefined) {
                console.log(`✅ ${tom.name}: FIXED!`);
            } else {
                console.log(`❌ ${tom.name}: Still broken`);
            }
        } catch (error) {
            console.log(`❌ ${tom.name}: Error - ${error.message}`);
        }
    }

    // Test with GrooveScribe constants if available
    if (typeof constant_OUR_MIDI_KICK_NORMAL !== 'undefined') {
        console.log('\n🎯 Testing with GrooveScribe Constants:');
        const constantTests = [
            { name: 'Kick (constant)', midi: constant_OUR_MIDI_KICK_NORMAL },
            { name: 'Tom 2 (constant)', midi: constant_OUR_MIDI_TOM2_NORMAL },
            { name: 'Tom 3 (constant)', midi: constant_OUR_MIDI_TOM3_NORMAL }
        ];

        for (const test of constantTests) {
            try {
                const result = MIDI.WebAudio.noteOn(9, test.midi, 100, 0);
                if (result && result !== undefined) {
                    console.log(`✅ ${test.name}: MIDI ${test.midi} - Working`);
                } else {
                    console.log(`❌ ${test.name}: MIDI ${test.midi} - Broken`);
                }
            } catch (error) {
                console.log(`❌ ${test.name}: MIDI ${test.midi} - Error: ${error.message}`);
            }
        }
    }

    const success = working === total;
    return { working, broken, total, success, brokenDrums };
})(); 