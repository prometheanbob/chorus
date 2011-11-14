describe("chorus.views.Header", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burke",
            "fullName": "Daniel Francis Burke"
        });
        this.view = new chorus.views.Header();
        this.view.render();
    });

    it("should have a search field", function() {
        this.view.render();
        expect(this.view.$("input[type=text].search")).toExist();
    });

    it("should have a link to the dashboard", function() {
        expect(this.view.$(".logo a").attr("href")).toBe("#/");
    });

    describe("username", function() {
        describe("where the user has no fullName", function() {
            beforeEach(function() {
                chorus.user.unset("fullName");
            })

            describe("and the synthesized full name is less than 21 characters", function() {
                beforeEach(function() {
                    chorus.user.set({ firstName: "0123456789", lastName: "012345" });
                    this.view.render();
                });

                it("displays the synthesized full name", function() {
                    expect(this.view.$(".username a").text().trim()).toBe("0123456789 012345");
                });
            })

            describe("and the synthesized full name is more than 20 characters", function() {
                beforeEach(function() {
                    chorus.user.set({ firstName: "012345678901234", lastName: "0123456789" });
                    this.view.render();
                })

                it("displays the abbreviated synthesized full name", function() {
                    expect(this.view.$(".username a").text().trim()).toBe("012345678901234 0.");
                });
             })

        });

        describe("where the user has a fullName", function() {
            describe("less than or equal to 20 characters", function() {
                it("displays the user's full name", function() {
                    expect(this.view.$(".username a").text().trim()).toBe("Daniel Francis Burke");
                })
            })

            describe("greater than 20 characters", function() {
                beforeEach(function() {
                    chorus.user.set({
                        "lastName" : "Burkes",
                        "fullName": "Daniel Francis Burkes"
                    });
                    this.view.render();
                });

                it("displays the user's abbreviated full name", function() {
                    expect(this.view.$(".username a").text().trim()).toBe("Daniel B.");
                })
            })
        })

        it("has a hidden popup menu", function() {
            expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
        })

        it("has a title attribute equal to the non-abbreviated full name", function() {
            chorus.user.set({
                "lastName" : "Burkes",
                "fullName": "Daniel Francis Burkes, III"
            });
            this.view.render();

            expect(this.view.$(".username a").attr('title')).toBe("Daniel Francis Burkes, III");
        })

        describe("when clicked", function() {
            beforeEach(function() {
                this.view.$(".username a").click();
            })

            it("shows a popup menu", function() {
                expect(this.view.$(".menu.popup_username")).not.toHaveClass("hidden");
            })

            describe("and when clicked again", function(){
                beforeEach(function() {
                    this.view.$(".username a").click();
                });
                it("becomes hidden again", function(){
                    expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
                });
            });
        })
    })

    describe("account", function(){
        describe("when clicked", function() {
            beforeEach(function() {
                this.view.$(".account a").click();
            })

            it("shows a popup menu", function() {
                expect(this.view.$(".menu.popup_account")).not.toHaveClass("hidden");
            })

            describe("and when clicked again", function(){
                beforeEach(function() {
                    this.view.$(".account a").click();
                });
                it("becomes hidden again", function(){
                    expect(this.view.$(".menu.popup_account")).toHaveClass("hidden");
                });
            });
        })
    });

    describe("multiple popups", function(){
        describe("at most one is ever visible", function(){
            beforeEach(function(){
                this.view.$(".username a").click();
            });

            it("hides the old popup when you create a new popup", function(){
                expect(this.view.$(".menu.popup_username")).not.toHaveClass("hidden");

                this.view.$(".account a").click();
                expect(this.view.$(".menu.popup_username")).toHaveClass("hidden");
                expect(this.view.$(".menu.popup_account")).not.toHaveClass("hidden");
            });
        });
    });
});
