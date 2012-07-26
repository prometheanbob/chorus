require File.join(File.dirname(__FILE__), '../integration/spec_helper')

#This file has the selenium tests for dataset actions. The actions are as follows:
#Viewing a dataset inside a GPDB instance
#includes the view's statistics, metadata and definition
#associating dataset to a workspace
#Run Analyze on a table

describe "Viewing data inside GPDB instances" do
  let(:instance_name) { "Instance#{Time.now.to_i}" }
  let(:database_name) { "gpdb_garcia" }
  let(:schema_name) { "gpdb_test_schema" }

  before(:each) do
    login('edcadmin', 'secret')

    create_gpdb_instance(:name => instance_name)

    click_link instance_name
    click_link database_name
    click_link schema_name
    click_link dataset_name
  end

  context "for a table" do
    let(:dataset_name) { "base_table1" }

    it "displays a data preview" do
      click_button "Data Preview"

      within(".data_table") do
        page.should have_selector(".th")
      end
    end

    it "includes the table's statistics and metadata" do
      within "#sidebar" do
        page.find("li[data-name='statistics']").click
      end

      within ".statistics_detail" do
        # TODO we can't make assertions about things that change such as last_analyzed and disk_size
        page.should have_content("Source Table")
        page.should have_content("Columns 5")
        page.text.should =~ /Rows \d+/
      end
    end
  end

  context "on a view" do
    let(:dataset_name) { "view1" }

    it "includes the view's statistics, metadata and definition" do
      within "#sidebar" do
        page.find("li[data-name='statistics']").click
      end

      within ".statistics_detail" do
        page.should have_content("Source View")
        page.should have_content("Columns 2")
        page.should have_content("Description This is the comment on view - __lenny")
      end

      within ".definition" do
        page.should have_content("SELECT a.artist, a.title FROM top_1_000_songs_to_hear_before_you_die a;")
      end
    end
  end

end

describe "associating dataset to a workspace" do

  it "Associates a dataset to a workspace" do

    login('edcadmin','secret')
    create_valid_workspace(:name => "associate_dataset")
    wait_for_ajax
    workspace_id = Workspace.find_by_name("associate_dataset").id
    create_gpdb_instance(:name => "data_associate")
    click_link"data_associate"
    wait_for_ajax
    click_link "gpdb_garcia"
    wait_for_ajax
    click_link "gpdb_test_schema"
    wait_for_ajax
    page.should have_content "base_table1"
    click_link "Associate dataset with a workspace"

    within(".collection_list") do
      page.find("li[data-id='#{workspace_id}']").click
    end
    click_submit_button
    wait_for_ajax
    go_to_workspace_page
    click_link "associate_dataset"
    click_link "Data"
    page.should have_content "base_table1"

  end

end

describe "run analyze on a table" do
  before(:each) do
    login('edcadmin', 'secret')
  end

  it "runs analyze on a table from instance browsing view" do
    create_gpdb_instance(:name => "RunAnalyze")
    wait_for_ajax
    click_link("RunAnalyze")
    wait_for_ajax
    click_link("gpdb_garcia")
    wait_for_ajax
    click_link("gpdb_test_schema")
    wait_for_ajax
    click_link ("Run Analyze")
    click_button "Run Analyze"
    wait_for_ajax(10)
    page.should have_content("Analyze is running")
  end
end