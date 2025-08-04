/**
 * Modern Audio System for GrooveScribe
 * Standalone version that works without ES6 modules
 * Replaces broken MIDI.js + soundfont system with Web Audio API + MP3 files
 */

(function() {
    'use strict';

    // AudioManager class (standalone version)
    class AudioManager {
        constructor() {
            this.audioContext = null;
            this.isInitialized = false;
            this.isPlaying = false;
            this.isPaused = false;
            this.currentTempo = 120;
            this.autoSpeedUpActive = false;
            this.autoSpeedUpSettings = {
                bpmAmount: 5,
                intervalMinutes: 2,
                keepIncreasing: false
            };
            this.playbackStartTime = null;
            this.lastSpeedUpTime = null;
            this.audioBuffers = {};
            
            // MIDI note to drum sample mapping (GrooveScribe specific)
            this.midiToSample = {
                // Kick
                35: 'kick',           // constant_OUR_MIDI_KICK_NORMAL
                
                // Snare variations
                38: 'snare_normal',   // constant_OUR_MIDI_SNARE_NORMAL  
                21: 'snare_ghost',    // constant_OUR_MIDI_SNARE_GHOST
                22: 'snare_accent',   // constant_OUR_MIDI_SNARE_ACCENT
                37: 'snare_xstick',   // constant_OUR_MIDI_SNARE_XSTICK
                25: 'snare_flam',     // constant_OUR_MIDI_SNARE_FLAM
                23: 'snare_drag',     // constant_OUR_MIDI_SNARE_DRAG
                24: 'snare_buzz',     // constant_OUR_MIDI_SNARE_BUZZ
                
                // Hi-hat variations
                42: 'hihat_normal',   // constant_OUR_MIDI_HIHAT_NORMAL
                46: 'hihat_open',     // constant_OUR_MIDI_HIHAT_OPEN
                44: 'hihat_foot',     // constant_OUR_MIDI_HIHAT_FOOT
                108: 'hihat_accent',  // new mapping
                26: 'hihat_accent',   // legacy alias (was constant_OUR_MIDI_HIHAT_ACCENT)
                51: 'ride',           // constant_OUR_MIDI_HIHAT_RIDE
                53: 'ride_bell',      // constant_OUR_MIDI_HIHAT_RIDE_BELL
                105: 'cowbell',       // new mapping
                56: 'cowbell',        // legacy alias (was constant_OUR_MIDI_HIHAT_COW_BELL)
                49: 'crash',          // constant_OUR_MIDI_HIHAT_CRASH
                52: 'stacker',        // new mapping
                55: 'stacker',        // legacy alias (was constant_OUR_MIDI_HIHAT_STACKER)
                
                // Toms
                48: 'tom1',           // constant_OUR_MIDI_TOM1_NORMAL (High Tom)
                47: 'tom2',           // constant_OUR_MIDI_TOM2_NORMAL (Mid Tom)
                45: 'tom3',           // constant_OUR_MIDI_TOM3_NORMAL (Low Tom) 
                43: 'tom4',           // constant_OUR_MIDI_TOM4_NORMAL (Floor Tom)
                
                // Metronome
                76: 'metronome_normal',  // constant_OUR_MIDI_HIHAT_METRONOME_NORMAL
                77: 'metronome_accent'   // constant_OUR_MIDI_HIHAT_METRONOME_ACCENT
            };
            
            // Sample file name mapping
            this.sampleFiles = {
                'kick': 'Kick.mp3',
                'snare_normal': 'Snare Normal.mp3',
                'snare_ghost': 'Snare Ghost.mp3', 
                'snare_accent': 'Snare Accent.mp3',
                'snare_xstick': 'Snare Cross Stick.mp3',
                'snare_flam': 'Snare Flam.mp3',
                'snare_drag': 'Drag.mp3',
                'snare_buzz': 'Buzz.mp3',
                'hihat_normal': 'Hi Hat Normal.mp3',
                'hihat_open': 'Hi Hat Open.mp3',
                'hihat_foot': 'Hi Hat Foot.mp3', 
                'hihat_accent': 'Hi Hat Accent.mp3',
                'ride': 'Ride.mp3',
                'ride_bell': 'Bell.mp3',
                'cowbell': 'Cowbell.mp3',
                'crash': 'Crash.mp3',
                'stacker': 'Stacker.mp3',
                'tom1': '10 Tom.mp3',        // High Tom
                'tom2': '16 Tom.mp3',        // Mid Tom  
                'tom3': 'Rack Tom.mp3',      // Low Tom
                'tom4': 'Floor Tom.mp3',     // Floor Tom
                'metronome_normal': 'metronomeClick.mp3',
                'metronome_accent': 'metronome1Count.mp3'
            };
        }

        async initialize() {
            try {
                await this.initializeAudioContext();
                await this.loadAudioSamples();
                this.isInitialized = true;
                console.log('Modern AudioManager initialized successfully');
                return true;
            } catch (error) {
                console.error('Failed to initialize AudioManager:', error);
                throw error;
            }
        }

        async initializeAudioContext() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) {
                    throw new Error('Web Audio API not supported');
                }

                this.audioContext = new AudioContext();
                
                // Resume context if suspended (required by modern browsers)
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }

                console.log('Audio context initialized');
            } catch (error) {
                console.error('Failed to initialize audio context:', error);
                throw error;
            }
        }

        async loadAudioSamples() {
            try {
                const basePath = 'soundfont/NewDrumSamples/MP3/';
                const loadPromises = Object.entries(this.sampleFiles).map(async ([sampleName, fileName]) => {
                    try {
                        const url = basePath + fileName;
                        const response = await fetch(url);
                        if (!response.ok) {
                            console.warn(`Failed to load sample: ${sampleName} (${fileName})`);
                            return;
                        }
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                        this.audioBuffers[sampleName] = audioBuffer;
                        console.log(`Loaded sample: ${sampleName}`);
                    } catch (error) {
                        console.warn(`Error loading sample ${sampleName}:`, error);
                    }
                });

                await Promise.all(loadPromises);
                console.log('Audio samples loaded:', Object.keys(this.audioBuffers));
            } catch (error) {
                console.warn('Some audio samples failed to load:', error);
            }
        }

        // Main API method - plays a drum sound by MIDI note number (replaces MIDI.js)
        playMidiNote(channel, midiNote, velocity = 127, delay = 0) {
            if (!this.isInitialized) {
                console.warn('AudioManager not initialized');
                return false;
            }

            const sampleName = this.midiToSample[midiNote];
            if (!sampleName) {
                console.warn(`No sample mapping for MIDI note: ${midiNote}`);
                return false;
            }

            const normalizedVelocity = Math.max(0, Math.min(1, velocity / 127));
            return this.playSample(sampleName, normalizedVelocity, delay);
        }

        // Modern audio sample playback
        playSample(sampleName, velocity = 1.0, when = 0) {
            if (!this.audioBuffers[sampleName]) {
                console.warn(`Sample not found: ${sampleName}`);
                return false;
            }

            try {
                const source = this.audioContext.createBufferSource();
                const gainNode = this.audioContext.createGain();
                
                source.buffer = this.audioBuffers[sampleName];
                gainNode.gain.value = Math.max(0, Math.min(1, velocity));
                
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                const playTime = when || this.audioContext.currentTime;
                source.start(playTime);
                
                return true;
                
            } catch (error) {
                console.error(`Failed to play sample ${sampleName}:`, error);
                return false;
            }
        }

        // Get available samples for debugging
        getAvailableSamples() {
            return Object.keys(this.audioBuffers);
        }

        // Get MIDI mapping for debugging
        getMidiMapping() {
            return this.midiToSample;
        }

        // Clean up resources
        destroy() {
            if (this.audioContext) {
                this.audioContext.close();
            }
            this.isInitialized = false;
        }
    }

    // GrooveScribe Audio Integration
    class GrooveScribeAudio {
        constructor() {
            this.audioManager = null;
            this.initialized = false;
        }

        async init() {
            try {
                console.log('Initializing modern audio system...');
                this.audioManager = new AudioManager();
                await this.audioManager.initialize();
                
                // Create MIDI.js bridge for backward compatibility
                this.createMidiJsBridge();
                
                // Replace the broken play_single_note_for_note_setting function
                this.replaceBrokenAudioFunctions();
                
                // Add modern enhancements
                this.addAudioEnhancements();
                
                this.initialized = true;
                console.log('Modern audio system initialized successfully');
                
            } catch (error) {
                console.error('Failed to initialize modern audio system:', error);
                // Continue without modern audio - legacy MIDI.js may still work
            }
        }

        createMidiJsBridge() {
            // Create a modern replacement for MIDI.js that uses our AudioManager
            if (!window.MIDI) {
                window.MIDI = {};
            }

            const self = this;

            // Replace MIDI.WebAudio with our modern system
            window.MIDI.WebAudio = {
                noteOn: (channel, note, velocity, delay) => {
                    if (self.audioManager) {
                        return self.audioManager.playMidiNote(channel, note, velocity, delay);
                    }
                    return false;
                },
                noteOff: () => {
                    // Note off is not needed for drum samples (they're one-shots)
                    return true;
                },
                stopAllNotes: () => {
                    // Not implemented for drum samples
                    return true;
                }
            };

            // Also replace MIDI.AudioTag for full compatibility
            window.MIDI.AudioTag = {
                noteOn: (channel, note, velocity, delay) => {
                    if (self.audioManager) {
                        return self.audioManager.playMidiNote(channel, note, velocity, delay);
                    }
                    return false;
                },
                noteOff: () => {
                    return true;
                }
            };

            console.log('MIDI.js bridge created successfully');
        }

        replaceBrokenAudioFunctions() {
            const self = this;
            
            // Replace the global play_single_note_for_note_setting function
            window.play_single_note_for_note_setting = (note_val) => {
                if (self.audioManager) {
                    return self.audioManager.playMidiNote(9, note_val, 127, 0);
                } else {
                    console.warn('AudioManager not available, falling back to legacy MIDI.js');
                    // Fallback to original implementation
                    if (window.MIDI && window.MIDI.WebAudio) {
                        return window.MIDI.WebAudio.noteOn(9, note_val, 127, 0);
                    } else if (window.MIDI && window.MIDI.AudioTag) {
                        return window.MIDI.AudioTag.noteOn(9, note_val, 127, 0);
                    }
                    return false;
                }
            };

            console.log('Audio functions replaced with modern implementation');
        }

        addAudioEnhancements() {
            // Add modern audio enhancements
            if (this.audioManager) {
                // Expose audio manager globally for debugging
                window.modernAudioManager = this.audioManager;
                
                // Add audio test function
                window.testDrumSound = (midiNote) => {
                    if (this.audioManager) {
                        const result = this.audioManager.playMidiNote(9, midiNote, 127, 0);
                        console.log(`Testing MIDI note ${midiNote}: ${result ? 'SUCCESS' : 'FAILED'}`);
                        return result;
                    }
                    return false;
                };

                // Add function to get available samples
                window.getAvailableAudioSamples = () => {
                    if (this.audioManager) {
                        return this.audioManager.getAvailableSamples();
                    }
                    return [];
                };

                // Add MIDI mapping debugging
                window.getMidiMapping = () => {
                    if (this.audioManager) {
                        return this.audioManager.getMidiMapping();
                    }
                    return {};
                };

                // Add immediate audio context resume on user interaction
                const resumeAudioContext = async () => {
                    if (this.audioManager.audioContext && this.audioManager.audioContext.state === 'suspended') {
                        try {
                            await this.audioManager.audioContext.resume();
                            console.log('Audio context resumed');
                        } catch (error) {
                            console.error('Failed to resume audio context:', error);
                        }
                    }
                };

                // Resume audio context on first user interaction
                document.addEventListener('click', resumeAudioContext, { once: true });
                document.addEventListener('keydown', resumeAudioContext, { once: true });
                document.addEventListener('touchstart', resumeAudioContext, { once: true });
            }
        }
    }

    // Initialize the modern audio system when DOM is ready
    function initializeModernAudio() {
        const grooveScribeAudio = new GrooveScribeAudio();
        
        // Wait for page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => grooveScribeAudio.init(), 500);
            });
        } else {
            setTimeout(() => grooveScribeAudio.init(), 500);
        }

        // Make it globally accessible
        window.grooveScribeAudio = grooveScribeAudio;
    }

    // Start initialization
    initializeModernAudio();

})(); 