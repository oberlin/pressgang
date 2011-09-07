(function($, pressgang) {

/**
 * Display an error to the user that occurred during an action.
 */
var showActionError = function(text) {
	alert(text);
};

/**
 * A class to handle executing an action.
 */
var Executer = function(options) {

	// Get the URL to start the action
	this.executeURL = options.executeURL;

	// Create a progress monitor to track the execution of the action
	this.monitor = new ProgressMonitor(options.progressURL, options.progressContainer);
};

/**
 * Start the action and begin polling for updates.
 */
Executer.prototype.execute = function() {
	$.ajax({
		dataType: 'json',
		error: $.proxy(this._handleError, this),
		success: $.proxy(this._monitorLog, this),
		url: this.executeURL
	});
};

/**
 * Begin monitoring the progress log if the action has been properly started.
 */
Executer.prototype._monitorLog = function(data) {
	this.monitor.beginUpdating();
};

/**
 * Handle an error when the action cannot be started.
 */
Executer.prototype._handleError = function(xhr, status) {
	showActionError(pressgang.utils.getErrorText(xhr, pressgang.gettext("Unable to begin executing action.")));
};

/**
 * A class to monitor the progress of an action.
 *
 * This polls a URL that provides progress on a given action and updates the
 * page markup with the markup generated to reflect the progress made on the
 * current action.  The action log should provide most error handling, but this
 * class also provides basic handling for when the markup cannot be generated.
 */
var ProgressMonitor = function(url, container) {

	// Get the URL that will give us progress reports
	this.url = url;

	// Get a reference to the element that will display the progress updates
	this.$log = $(container);

	// Cache the viewport height
	this.windowHeight = $(window).height();

	// Whether or not to keep polling for updates
	this.keepUpdating = false;

	// Keep track of the content length of the returned markup
	this.contentLength = 0;

	// The number of null-data responses received
	this.nullResponses = 0;

};

/**
 * CSS identifiers used in the markup generated by the progress log.
 */
ProgressMonitor.CSS = {
	activeStep:    ".follow",
	currentAction: ".action.in-progress"
};

/**
 * How often to poll for updates, in milliseconds.
 */
ProgressMonitor.POLL_INTERVAL_MS = 1000;

/**
 * How fast to scroll to the newest log step, in milliseconds.
 */
ProgressMonitor.SCROLL_SPEED_MS = 250;

/**
 * How many null-data responses must be received before the progress monitor
 * decides that an action has timed out.
 */
ProgressMonitor.NULL_DATA_RESPONSES_ALLOWED = 5;

/**
 * Display the progress of an action to the user.
 */
ProgressMonitor.prototype._renderUpdate = function(data) {

	var nullResponse = pressgang.utils.objectIsEmpty(data);

	// Update the markup if the content has changed
	if (!nullResponse && data.size !== this.contentLength) {
		this.contentLength = data.size;

		// Update the progress log
		this.$log.html(data.markup.log);

		// Pulse the current action
		this.$log.find(ProgressMonitor.CSS.currentAction).stop();

		// Scroll the page to the most recent step
		var $follow = this.$log.find(ProgressMonitor.CSS.activeStep);
		if ($follow.length) {
			var followBottom = $follow.offset().top + $follow.outerHeight();
			var scrollTo = followBottom - this.windowHeight;
			$("html:not(:animated),body:not(:animated)").animate(
				{scrollTop: scrollTo + 50}, ProgressMonitor.SCROLL_SPEED_MS);
		}
	}

	// Since it seems that a null-data response is sometimes received even when
	// the action is proceeding as planned, allow a certain amount of null
	// responses to take place, continuing with the progress polling until we
	// have exceeded our total allowed null-response count, at which point we
	// declare the action to be ended.
	if (nullResponse) {
		this.nullResponses++;
		actionEnded = (this.nullResponses >= ProgressMonitor.NULL_DATA_RESPONSES_ALLOWED);
	} else {
		actionEnded = data.ended;
	}

	// If the action has ended, stop refreshing the log, otherwise
	// continue polling for updates.
	if (actionEnded) {
		this.endUpdating();
	} else if (this.keepUpdating) {
		setTimeout(this._requestUpdateProxy, ProgressMonitor.POLL_INTERVAL_MS);
	}

	// If we ended due to too many null-data responses, alert the user of this
	if (nullResponse && actionEnded) {
		showActionError(pressgang.gettext("The action has timed out."));
	}
};

/**
 * Request an update action progress report.
 */
ProgressMonitor.prototype._requestUpdate = function() {
	$.ajax({
		dataType: 'json',
		error: this._handleErrorProxy,
		success: this._renderUpdateProxy,
		url: this.url
	});
};

/**
 * Signal that the class should stop polling for updates.
 */
ProgressMonitor.prototype.endUpdating = function() {
	this.keepUpdating = false;
};

/**
 * Handle an error that occurred during the polling for progress log updates.
 */
ProgressMonitor.prototype._handleError = function(xhr, status) {
	this.endUpdating();
	showActionError(pressgang.utils.getErrorText(xhr, pressgang.gettext("Unable to refresh the progress log.")));
};

/**
 * Begin the process of polling for action progress updates.
 */
ProgressMonitor.prototype.beginUpdating = function() {
	this.keepUpdating = true;
	this._renderUpdateProxy = $.proxy(this._renderUpdate, this);
	this._requestUpdateProxy = $.proxy(this._requestUpdate, this);
	this._handleErrorProxy = $.proxy(this._handleError, this);
	this._requestUpdate();
};

// Make the executer available to other scripts
pressgang.actions.Executer = Executer;

})(jQuery, pressgang);
