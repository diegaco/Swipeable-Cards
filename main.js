(function(){
    'use strict';

    class Cards {
        constructor() {
            this.cards = document.querySelectorAll('.card');
            this.onStart = this.onStart.bind(this);
            this.onMove = this.onMove.bind(this);
            this.onEnd = this.onEnd.bind(this);
            this.update = this.update.bind(this);
            this.target = null;
            this.targetX = null;
            this.targetBCR = null;
            this.startX = 0;
            this.currentX = 0;
            this.dragging = false;
            this.screenX = 0;

            this.addEventListeneres();

            requestAnimationFrame(this.update);
        }

        addEventListeneres() {
            console.log(this);
            document.addEventListener('touchstart', this.onStart);
            document.addEventListener('touchmove', this.onMove);
            document.addEventListener('touchend', this.onEnd);

            document.addEventListener('mousedown', this.onStart);
            document.addEventListener('mousemove', this.onMove);
            document.addEventListener('mouseup', this.onEnd);
        }

        onStart(evt) {


            if (this.target) {
                return; 
            }

            if (!evt.target.classList.contains('card')) {
                return;
            }

            this.target = evt.target;
            this.targetBCR = this.target.getBoundingClientRect();

            this.startX = evt.pageX || evt.touches[0].pageX;
            this.currentX = this.startX;

            this.dragging = true;
            this.target.style.willChange = 'transform';

            evt.preventDefault();
        }

        onMove(evt) {
            if (!this.target) {
                return;
            }

            this.currentX = evt.pageX || evt.touches[0].pageX;
        }

        onEnd(evt) {
            if (!this.target) {
                return;
            }

            this.targetX = 0;
            let screenX = this.currentX - this.startX;
            const threshold = this.targetBCR.width * 0.35;
            if (Math.abs(screenX) > threshold) {
               this.targetX = (screenX > 0) ? this.targetBCR.width : -this.targetBCR.width; 
            }
            this.dragging = false;
        }

        update() {

            requestAnimationFrame(this.update);

            if (!this.target) {
                return;
            }

            if (this.dragging) {
                this.screenX = this.currentX - this.startX;
            } else {
                this.screenX += (this.targetX - this.screenX) / 4; 
            }

            const normalizeDragDistance = (Math.abs(this.screenX) / this.targetBCR.width);
            const opacity = 1 - Math.pow(normalizeDragDistance,3);


            this.target.style.transform = 'translateX(' + this.screenX + 'px)';
            this.target.style.opacity = opacity;

            const isNearlyAtStart = (Math.abs(this.screenX) < 0.01);
            const isNearlyInvisible = (opacity < 0.01);

            //User has finished dragging
            if (!this.dragging) {
                
                //if the card is nearly gone
                if (isNearlyInvisible) {

                    //if there`s still a target and the target is still attached to the DOM
                    //Morgan Law
                    //"no (A y B)" es lo mismo que "(no A) o (no B)"
                    //y también,
                    //"no (A o B)" es lo mismo que "(no A) y (no B)"
                    if (!this.target || !this.target.parentNode) {
                        return;
                    }

                    let isAfterCurrentTarget = false;
                    var self = this; //redeclare because forEach callback reset this

                    const onTransitionEnd = function (evt) {
                        self.target = null;
                        evt.target.style.transition = 'none';
                        evt.target.removeEventListener('transitionend', onTransitionEnd);
                    }

                    Array.from(this.cards).forEach(function(card, index) {
                        if (card === self.target) {
                            isAfterCurrentTarget = true;
                            return;
                        }

                        if (!isAfterCurrentTarget) {
                            return;
                        }


                        card.style.transform = 'translateY(' + (self.targetBCR.height + 20) + 'px)';
    
                        requestAnimationFrame(function() {
                            card.style.transition = 'transform 1s cubic-bezier(0,0,.31,1)';
                            card.style.transform = 'none';
                        });

                        card.addEventListener('transitionend', onTransitionEnd);
                    });

                    this.target.parentNode.removeChild(this.target);

                }

                if (isNearlyAtStart) {
                    this.target.style.willChange = 'initial';
                    this.target.style.transform = 'none';
                    this.target = null; 
                }
            }
        }

    }

    window.addEventListener('load', () => new Cards());


}());
