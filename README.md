# xOneDriveUpdater
Define a list of 'watched' t add-ons and have daily updates which push to your OneDrive (with a handle updating batch script which can be ran through Windows Scheduler for automatic updating). This is through a Node web server which you register your OneDrive credentials with.

Defines different branches for different providers of content to be synced up. 
master refers to core functionality that all implementations use (and is obviously based off of the Curse implementation) and the other branches refer to implementations of that provider.

(May clean up master and make it specifically agnostic at some point - but be clear, MASTER IS NOT TO BE USED BY ANY ENDUSER - just developers).
