// ==UserScript==
// @name         Message Logger for ig
// @namespace    https://github.com/SoBloxsy/ig-unsent-message-logger
// @version      1.2
// @description  Automatically backup messages when added, and restore backup when deleted
// @author       Irenfw
// @match        https://www.instagram.com/direct/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/SoBloxsy/ig-unsent-message-logger/main/script.js
// @downloadURL  https://raw.githubusercontent.com/SoBloxsy/ig-unsent-message-logger/main/script.js
// ==/UserScript==

(function() {
    'use strict';

    // Object to store backups
    let backups = {};

    // Function to create a backup of a div
    function createBackup(div) {
        let divId = div.getAttribute('data-backup-id') || 'div-' + Math.random().toString(36).substr(2, 9); // Generate a random ID if no ID exists
        div.setAttribute('data-backup-id', divId);
        backups[divId] = {
            node: div.cloneNode(true),
            parent: div.parentNode,
            nextSibling: div.nextSibling
        };
    }

    // Function to restore a backup of a div
    function restoreBackup(divId) {
        if (backups[divId]) {
            let backup = backups[divId];
            let backupDiv = backup.node.cloneNode(true);
            backupDiv.removeAttribute('data-backup-id'); // Remove ID to prevent ID conflicts

            // Find the child div with aria-label="Double tap to like" and apply outline
            let targetChild = backupDiv.querySelector('div[aria-label="Double tap to like"]');
            if (targetChild) {
                targetChild.style.outline = "1px solid red"; // Add outline to target child div
            }

            if (backup.nextSibling) {
                backup.parent.insertBefore(backupDiv, backup.nextSibling); // Insert before the next sibling
            } else {
                backup.parent.appendChild(backupDiv); // Append to the parent if no next sibling
            }
            console.log('Backup restored for div:', divId);
        }
    }

    // Function to watch for new divs added or removed from the classes
    function watchForDivs() {
        const targetClasses = ['x78zum5', 'xdt5ytf'];
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.classList && targetClasses.every(cls => node.classList.contains(cls))) {
                        createBackup(node);
                    }
                });
                mutation.removedNodes.forEach(function(node) {
                    if (node.classList && targetClasses.every(cls => node.classList.contains(cls))) {
                        let divId = node.getAttribute('data-backup-id');
                        if (divId) {
                            restoreBackup(divId);
                            delete backups[divId]; // Remove the backup after restoring
                        }
                    }
                });
            });
        });

        // Start observing mutations in the document body
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Watching for new divs with classes:', targetClasses.join(' '));
    }

    // Initialize watching for divs
    watchForDivs();

})();