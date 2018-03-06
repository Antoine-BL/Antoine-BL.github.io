var menu;
var threeDots;
var events = new function () {
    this.distTravelled = 0;
    this.currentDY = 0;
    this.startingTop;
    this.scrolling = false;
    this.timeoutID = null;
    this.targetDiv = null;
    this.animationID;
    this.done = true;
    this.transition = false;


    this.scroll = function () {
        if (events.transition) {
            return;
        }
        var transitionThreshhold = 1200;
        events.distTravelled += event.deltaY;

        if (!events.scrolling) {
            events.targetDiv = document.getElementById('divCurrentPage');
        }
        
        if (events.done && !events.transition) {
            events.startingTop = parseFloat(window.getComputedStyle(events.targetDiv).top.replace('px', ''));
            events.currentDY = events.startingTop;
            events.animationID = window.requestAnimationFrame(events.approachPos);
        }

        window.clearTimeout(events.timeoutID);
        events.timeoutID = window.setTimeout(() => events.doneScrolling(events.timeoutID), 200);

        if (pageTransitions.currentPageState <= 0 && events.distTravelled > transitionThreshhold) {
            events.distTravelled = transitionThreshhold;
        } else if (pageTransitions.currentPageState >= pageTransitions.pages.length - 1  && events.distTravelled < -transitionThreshhold) {
            events.distTravelled = -transitionThreshhold;
        } else if (events.distTravelled > transitionThreshhold && !events.scrolling) {
            events.scrolling = true;
            window.cancelAnimationFrame(events.animationID);
            events.targetDiv.id = 'divOldPage';
            events.targetDiv.className += ' offScreen-down';
            var target = events.targetDiv;
            events.targetDiv = null;
            events.transition = true;
            window.setTimeout(() => {
                events.distTravelled = 0;
                target.remove();
                events.transition = false;
                events.done = true;
            }, 2000);
            pageTransitions.transitionToNextPage(false);
        } else if (events.distTravelled < -transitionThreshhold && !events.scrolling){
            events.scrolling = true;
            window.cancelAnimationFrame(events.animationID);
            events.targetDiv.id = 'divOldPage';
            events.targetDiv.className += ' offScreen-up';
            events.transition = true;
            var target = events.targetDiv;
            events.targetDiv = null;
            window.setTimeout(() => {
                events.distTravelled = 0;
                target.remove();
                events.transition = false;
                events.done = true;
            }, 2000);
            pageTransitions.transitionToNextPage(true);
        }
    }

    this.doneScrolling = function (id) {
        events.scrolling = false;
    }

    this.dragStart = function () {
    
    }

    this.dragMove = function () {

    }

    this.dragEnd = function () {

    }

    this.recoverPosition = function () {
        var damping = 0.1;
        if (events.currentDY.toFixed(0) != 0 && !events.transition) {
            events.animationID = window.requestAnimationFrame(events.recoverPosition);
            events.currentDY -= events.currentDY * damping;
            events.targetDiv.style.top = (events.startingTop + events.currentDY / 10) + 'px';
        } else {
            events.done = true;
            events.targetDiv.style.top = null;
            window.cancelAnimationFrame(events.animationID);
            events.animationID = null;
        }
    }

    this.approachPos = function () {
        var damping = 0.1;
        if (!events.transition) {   
            events.currentDY += (events.distTravelled - events.currentDY) * damping;
            events.targetDiv.style.top = (events.startingTop + events.currentDY / 10) + 'px';
    
            events.done = false;
            
            if (events.currentDY.toFixed(0) == events.distTravelled.toFixed(0)) {
                cancelAnimationFrame(events.animationID);
                events.animationID = window.requestAnimationFrame(events.recoverPosition);
                events.distTravelled = 0;
            } else {
                requestAnimationFrame(events.approachPos);
            }
        }
    }
}

var pageTransitions = new function () {
    this.currentPageState = 0;
    this.pages = [
        {
            url:'index.html',
            update: function () {}
        },
        {
            url:'about.html',
            update: function () {}
        },
        {
            url:'projects.html',
            update: function () {
                projectSlides.currentSlide = 0;
                projectSlides.makeTransition();
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
            return false;
        } else {
            pageTransitions.makeTransition();
            return true;
        }
    }

    /**
     * Transition to a specific page
     * @param {number} pageNum zero-based index of the page to transition to
     */
    this.makeTransition = async function () {
        var newPage = document.createElement('div');
        newPage.id = 'divCurrentPage';
        newPage.className = 'page';
        document.body.insertBefore(newPage, document.getElementById('bgUnder'));

        var title = (await pageTransitions.loadedPages[pageTransitions.currentPageState])[1];
        newPage.appendChild(title);

        var newMenu = document.createElement('div');
        newMenu.id = 'divMenu';
        newPage.appendChild(newMenu);
        newMenu.outerHTML = menu;

        var mainContent = (await pageTransitions.loadedPages[pageTransitions.currentPageState])[0];
        newPage.appendChild(mainContent);

        var newthreeDots = document.createElement('div');
        newthreeDots.id = 'divThreeDots';
        newPage.appendChild(newthreeDots);
        newthreeDots.outerHTML = threeDots;        

        pageTransitions.pages[pageTransitions.currentPageState].update();
    }

    /**
     * Pre-fetches all of the site's pages
     */
    this.preloadPages = function() {
        for (var i = 0; i < pageTransitions.pages.length; i++) {
            pageTransitions.loadedPages[i] = pageTransitions.getPage(pageTransitions.pages[i].url, ['divMainContent', 'divTitle'])
            .then(function OK(response) {return response})
            .catch(function ERR(err) { console.error(err); });
        }
    }
    
    /**
     * Returns an Element containing a part of another HTML page using selectors
     * @param {String} pageURL targeted page or resource to load from
     * @param {String[] | String} loadedIDs selector(s) to load in targeted page
     * @return {Element[]}
     */
    this.getPage = async function (pageURL, loadedIDs) {
        loadedIDs = Array.isArray(loadedIDs) ? loadedIDs : [loadedIDs];
        return new Promise(function(resolve, reject){            
            var req = new XMLHttpRequest;
            req.responseType = 'document';
            req.open('GET', pageURL, true);        
            req.onload = function(){
                if (this.status >= 200 && this.status < 300){
                    var tags = [];
                    loadedIDs.forEach(id => {
                        tags.push(req.response.getElementById(id));
                    })
                    resolve(tags);
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

var projectSlides = new function() {
    this.currentSlide = 0;
    this.slides = []

    /**
     * Pre-fetches project slides
     */
    this.preloadProjects = async function(){
        var slidesPage = (await pageTransitions.getPage('slides.html', ['divMainContent']))[0];
        for (var i = 0; i < slidesPage.children.length; i++) {
            projectSlides.slides.push(slidesPage.children.item(i));
        }
    }

    this.nextProject = async function(forward) {
        projectSlides.currentSlide += forward ? 1 : -1;

        if (projectSlides.currentSlide < 0 || projectSlides.currentSlide >= projectSlides.slides.length) {
            projectSlides.currentSlide < 0 ? 0 : (projectSlides.currentSlide >= projectSlides.slides.length ?
                                                        projectSlides.slides.length - 1 : projectSlides.currentSlide);
        } else {
            projectSlides.makeTransition();
        }
    }

    this.makeTransition = async function() {
        var repo = (await projectSlides.slides[projectSlides.currentSlide]).children.item(1).innerText;
        var repoURL = 'https://github.com/Antoine-BL/' + repo;
        var siteURL = 'https://Antoine-BL.github.io/' + (repo == 'Antoine-BL.github.io' ? '' : repo);
        document.getElementById('btnViewRepo').onclick = null;
        document.getElementById('btnViewRepo').onclick = () => window.open(repoURL);
        document.getElementById('btnViewSite').onclick = null;
        document.getElementById('btnViewSite').onclick = () => window.open(siteURL);
    
        document.getElementById('divSlideText').innerHTML = (await projectSlides.slides[projectSlides.currentSlide]).children.item(0).innerHTML;

        if (projectSlides.currentSlide > 0) {
            document.getElementById('divLeft').innerHTML = '<img id="imgLeft" src="left.png" class="leftArrow">';
            document.getElementById('imgLeft').onclick = () => projectSlides.nextProject(false);
        } else {
            document.getElementById('divLeft').innerHTML = '';
        }
        if (projectSlides.currentSlide < projectSlides.slides.length - 1) {
            document.getElementById('divRight').innerHTML = '<img id="imgRight" src="right.png" class="rightArrow">';
            document.getElementById('imgRight').addEventListener('click', () => projectSlides.nextProject(true));
        } else {
            document.getElementById('divRight').innerHTML = '';
        }
    }
}

async function preloadImages() {
    var me = new Image();  
    me.src = 'me.png';
    var right = new Image();
    right.src= 'right.png';
    var left = new Image();
    left.src = 'left.png';
}

/**
 * Binds events to listeners
 */
window.onload =  function() {
    alert('Warning: this website has not yet been completed.\n\n All text and functionality is subject to change and should, in no way, be considered final.');
    window.addEventListener('wheel', events.scroll);
    pageTransitions.preloadPages();
    projectSlides.preloadProjects();
    document.getElementById('tdAbout').addEventListener('click', () => {
        pageTransitions.currentPageState = 1;
        pageTransitions.makeTransition();
    });
    document.getElementById('tdProjects').addEventListener('click', () =>  {
        pageTransitions.currentPageState = 2;
        pageTransitions.makeTransition();
    });
    document.getElementById('tdDLResume').addEventListener('click', () => alert('this Feature has not yet been implemented'));
    menu = document.getElementById('divMenu').outerHTML;
    threeDots = document.getElementById('divThreeDots');
    threeDots = threeDots.outerHTML.replace(/<span id=\"scrollHint\".*<\/span>/, '');
    preloadImages();
}