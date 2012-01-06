describe("jquery extensions", function() {
    describe("button extensions", function() {
        beforeEach(function() {
            var container = $("<div/>");
            _.times(5, function(i) {
                container.append("<button>Original Text " + i + "</button>");
            });
            this.buttons = container.find("button");
            this.button = this.buttons.eq(0);
        });

        context("when #startLoading has not yet been called", function() {
            describe("#isLoading", function() {
                it("returns false", function() {
                    expect(this.button.isLoading()).toBeFalsy();
                });
            });

            describe("#stopLoading", function() {
                it("doesn't modify the text", function() {
                    this.button.stopLoading();
                    expect(this.button.text()).toBe("Original Text 0");
                });
            })
        });


        describe("startLoading", function() {
            beforeEach(function() {
                this.buttons.startLoading("test.deer");
            });

            it("sets the button's text to the supplied translation key", function() {
                expect(this.button.text()).toMatchTranslation("test.deer");
            });

            it("displays a spinner on the button", function() {
                expect(this.button.find("div[aria-role=progressbar]").length).toBe(1);
            });

            it("disables the button", function() {
                expect(this.button.attr("disabled")).toBe("disabled");
            });

            it("adds the is_loading class to the button", function() {
                expect(this.button).toHaveClass("is_loading");
            });

            context("calling startLoading again", function() {
                beforeEach(function() {
                    this.button.startLoading("breadcrumbs.home");
                });

                it("does not change the text", function() {
                    expect(this.button.text()).toMatchTranslation("test.deer");
                });

                it("does not add another spinner", function() {
                    expect(this.button.find("div[aria-role=progressbar]").length).toBe(1);
                });

                it("still restores to the original text when stopLoading is called", function() {
                    this.button.stopLoading();
                    expect(this.button.text()).toBe("Original Text 0");
                });
            });

            describe("stopLoading", function() {
                beforeEach(function() {
                    this.buttons.stopLoading();
                });

                it("sets each button's text to the original value", function() {
                    expect(this.buttons.eq(0).text()).toBe("Original Text 0");
                    expect(this.buttons.eq(1).text()).toBe("Original Text 1");
                });

                it("removes the spinner from each button", function() {
                    expect(this.buttons.find("div[aria-role=progressbar]").length).toBe(0);
                });

                it("enables the buttons", function() {
                    expect(this.buttons.eq(0)).not.toHaveAttr("disabled")
                    expect(this.buttons.eq(1)).not.toHaveAttr("disabled")
                });

                it("removes the loading class from the buttons", function() {
                    expect(this.buttons.eq(0)).not.toHaveClass("loading");
                    expect(this.buttons.eq(1)).not.toHaveClass("loading");
                });
            });
        });

        describe("#isLoading", function() {
            it("returns true when the first element in the collection is loading", function() {
                this.buttons.eq(0).startLoading();
                expect(this.buttons.isLoading()).toBeTruthy();
            });

            it("returns false when the first element in the collection is not loading", function() {
                this.buttons.startLoading();
                this.buttons.eq(0).stopLoading();
                expect(this.buttons.isLoading()).toBeFalsy();
            });
        });
    });

    describe("#hasQtip", function() {
        it("returns true for a single item on which qtip has been called", function() {
            var doc = '<div> <span class="foo"/> </div>';
            var item = $('.foo', doc);
            item.qtip();
            expect(item.length).toBe(1);
            expect(item.hasQtip()).toBeTruthy();

        });

        it("returns true for multiple items on which qtip has been called", function() {
            var doc = $('<div> <span class="foo"/><span class="bar"/></div>');
            var item1 = $('.foo', doc);
            item1.qtip();
            var item2 = $('.bar', doc);
            item2.qtip();
            expect($('span', doc).length).toBe(2);
            expect($('span', doc).hasQtip()).toBeTruthy();
        });

        it("returns false for an object that was qtipped and then qtip('destroy')ed", function() {
            var doc = $('<div> <span class="foo"/><span class="bar"/></div>');
            var item1 = $('.foo', doc);
            item1.qtip();
            // qtip('destroy') clears the form, removeData clears the objects -- need to call both
            item1.qtip('destroy');
            item1.removeData("qtip");
            expect(item1.hasQtip()).toBeFalsy();
        });

        it("returns false for an empty jQuery collection", function() {
            expect($().hasQtip()).toBeFalsy();
        });

        it("returns false for multiple items where not all have had qtip called", function() {
            var doc = '<div> <span class="foo"/><span class="bar"/></div>';
            var item1 = $('.foo', doc);
            item1.qtip();
            expect($('span', doc).length).toBe(2);
            expect($('span', doc).hasQtip()).toBeFalsy();
        });
    });

    describe("#outerHtml", function() {
        it("converts the first element to html", function() {
            var el = $("<a></a>").addClass("author");
            expect(el.outerHtml()).toBe('<a class="author"></a>');
        });
    });
});
