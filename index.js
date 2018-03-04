var events = new function () {
    this.distTravelled = 0;
    this.scrolling = false;
    this.timeoutID = null;


    this.scroll = function () {
        var transitionThreshhold = 300;
        events.distTravelled += event.deltaY;

        window.clearTimeout(events.timeoutID);
        events.timeoutID = window.setTimeout(() => events.doneScrolling(events.timeoutID), 200);

        if (events.distTravelled > transitionThreshhold && !events.scrolling) {
            events.scrolling = true;
            pageTransitions.transitionToNextPage(false);
        } else if (events.distTravelled < -transitionThreshhold && !events.scrolling){
            events.scrolling = true;
            pageTransitions.transitionToNextPage(true);
        }
    }

    this.doneScrolling = function (id) {
        events.distTravelled = 0;
        events.scrolling = false;
    }

    this.dragStart = function () {
    
    }

    this.dragMove = function () {

    }

    this.dragEnd = function () {

    }
}

var pageTransitions = new function () {
    this.currentPageState = 0;
    this.pages = [
        {
            url:'index.html',
            update: function () {

            }
        },
        {
            url:'about.html',
            update: function () {

            }
        },
        {
            url:'projects.html',
            update: function () {

            }
        }
    ];
    this.loadedPages = [];

    /**
     * Transitions to the next or previous page.
     * @param {boolean} forward whether to move forward or backward a page
     */
    this.transitionToNextPage = async function (forward) {
        pageTransitions.currentPageState += forward ? 1 : -1;

        if (pageTransitions.currentPageState < 0 || pageTransitions.currentPageState >= pageTransitions.pages.length){
            pageTransitions.currentPageState < 0 ? 0 : (pageTransitions.currentPageState >= pageTransitions.pages.length ?
                                                        pageTransitions.pages.length - 1 : pageTransitions.currentPageState);
        } else {
            document.getElementById('divMainContent').outerHTML = (await pageTransitions.loadedPages[pageTransitions.currentPageState]).outerHTML;
        }
    }

    /**
     * Transition to a specific page
     * @param {number} pageNum zero-based index of the page to transition to
     */
    this.setPageWithTransition = async function (pageNum) {
        pageTransitions.nextPage = null;
        pageTransitions.lastPage = null;
        pageTransitions.currentPageState = pageNum;
        document.getElementById('divMainContent').outerHTML = (await pageTransitions.loadedPages[pageTransitions.currentPageState]).outerHTML;
    }

    /**
     * Pre-fetches all of the site's pages
     */
    this.preloadPages = function() {
        for (var i = 0; i < pageTransitions.pages.length; i++) {
            pageTransitions.loadedPages[i] = getPage(pageTransitions.pages[i].url, 'divMainContent')
            .then(function OK (response) {return response})
            .catch(function ERR(err) { console.error(err); });
        }
    }

    /**
     * Returns a DOMString containing a part of another HTML page using selectors
     * @param {String} pageURL targeted page or resource to load from
     * @param {String} loadedID selector to load in targeted page
     * @return {DOMString}
     */
    async function getPage(pageURL, loadedID = 'body') {
        return new Promise(function(resolve, reject){       
            var req = new XMLHttpRequest;
            req.responseType = 'document';
            req.open('GET', pageURL, true);        
            req.onload = function(){
                if (this.status >= 200 && this.status < 300){
                    resolve(req.response.getElementById(loadedID));
                } else {
                    reject({
                        status: this.status,
                        statusText: this.statusText
                    });
                }
            }
            req.onerror = function () {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            }
            req.send();
        });
    }
}

/**
 * Binds events to listeners
 */
window.onload =  function() {
    alert('Warning: this website has not yet been completed.\n\n any text present is simply a placeholder');
    window.addEventListener('wheel', events.scroll);
    pageTransitions.preloadPages();
    document.getElementById('tdAbout').addEventListener('click', () => pageTransitions.setPageWithTransition(1));
    document.getElementById('tdProjects').addEventListener('click', () => pageTransitions.setPageWithTransition(2));
    document.getElementById('tdDLResume').addEventListener('click', () => alert('this Feature has not yet been implemented'));
}