var events = new function () {
    this.currentPageState = 0;
    this.distTravelled = 0;
    this.pages = [
        'index.html',
        'about.html',
        'projects.html'
    ];
    this.lastPage = null;
    this.nextPage = null;
    this.scrolling = false;
    this.timeoutID = null;


    this.scroll = function () {
        var transitionThreshhold = 300;
        events.distTravelled += event.deltaY;

        console.log(events.timeoutID);        
        window.clearTimeout(events.timeoutID);
        events.timeoutID = window.setTimeout(() => events.doneScrolling(events.timeoutID), 200);
        console.log(events.timeoutID);

        if (events.distTravelled > transitionThreshhold && !events.scrolling) {
            events.scrolling = true;
            events.transitionToNextPage(false);
        } else if (events.distTravelled < -transitionThreshhold && !events.scrolling){
            events.scrolling = true;
            events.transitionToNextPage(true);
        }
    }

    this.doneScrolling = function (id) {
        console.log('doneScrolling() ID:' + id);
        events.distTravelled = 0;
        events.scrolling = false;
    }

    this.dragStart = function () {
        console.log('mouseDown');
    }

    this.dragMove = function () {

    }

    this.dragEnd = function () {

    }

    /**
     * Transitions to the next or previous page.
     * @param {boolean} forward whether to move forward or backward a page
     */
    this.transitionToNextPage = async function (forward) {
        console.log('transition');
        if (forward) {
            events.currentPageState++;
            events.lastPage = document.querySelector('body');
        } else {
            events.currentPageState--;
            events.nextPage = document.querySelector('body');
        }

        if (events.currentPageState < 0 || events.currentPageState >= events.pages.length){
            events.currentPageState < 0 ? 0 : events.currentPageState >= (events.pages.length ? events.pages.length - 1 : events.currentPageState);
        } else {
            var pageToLoad;
            if (forward) {
                pageToLoad = events.nextPage;
                events.nextPage = null; 
            }
            else  {
                pageToLoad = events.lastPage; 
                events.lastPage = null; 
            }

            document.querySelector('body').innerHTML = await pageToLoad;

            events.preloadPages();
        }
    }

    /**
     * Transition to a specific page
     * @param {number} pageNum zero-based index of the page to transition to
     */
    this.setPageWithTransition = function (pageNum) {
        console.error('set not implemented');
    }

    this.preloadPages = async function() {
        if (events.currentPageState > 0 && !events.lastPage) {
            events.lastPage = getPage(events.pages[events.currentPageState - 1])
            .then(function OK (response) {return response})
            .catch(function ERR(err) { console.error(err); });
            console.log(await events.lastPage);
        }
        if (events.currentPageState < events.pages.length - 1 && !events.nextPage) {
            events.nextPage = getPage(events.pages[events.currentPageState + 1])
            .then(function OK (response) {return response})
            .catch(function ERR(err) { console.error(err); });
            console.log(events.nextPage);
        }
    }
}

/**
 * Binds events to listeners
 */
window.onload =  function() {
    window.addEventListener('wheel', events.scroll);
    events.preloadPages();
}

/**
 * Returns a DOMString containing a part of another HTML page using selectors
 * @param {String} pageURL targeted page or resource to load from
 * @param {String} loadedSel selector to load in targeted page
 * @return {DOMString}
 */
async function getPage(pageURL, loadedSel = 'body') {
    console.log('preloading');
    return new Promise(function(resolve, reject){       
        var req = new XMLHttpRequest;
        req.responseType = 'document';
        req.open('GET', pageURL, true);        
        req.onload = function(){
            if (this.status >= 200 && this.status < 300){
                console.log('done, success');
                resolve(req.response.querySelector(loadedSel).innerHTML);
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