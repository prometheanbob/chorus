class WorkfileExecutionsController < ApplicationController
  before_filter :find_schema, :find_workfile, :verify_workspace, :check_authorization
  require_params :check_id, :only => :create
  require_params :id, :only => :destroy, :field_name => :check_id

  def create
    account = @schema.account_for_user! current_user
    result = SqlExecutor.execute_sql(@schema, account, params[:check_id], params[:sql], :limit => row_limit)

    @workfile.execution_schema = @schema
    @workfile.save!
    if params[:download] && result
      cookies["fileDownload_#{params[:check_id]}".to_sym] = true
      send_data CsvWriter.to_csv(result.columns.map(&:name), result.rows), :type => "text/csv", :filename => "#{params[:file_name]}.csv", :disposition => "attachment"
    else
      present result
    end
  end

  def destroy
    SqlExecutor.cancel_query(@schema, @schema.account_for_user!(current_user), params[:id])
    head :ok
  end

  private

  def find_schema
    @schema = GpdbSchema.find(params[:schema_id])
  end

  def find_workfile
    @workfile = Workfile.find(params[:workfile_id] || params[:id])
  end

  def verify_workspace
    present_errors({:fields => {:workspace => {:ARCHIVED => {}}}}, :status => :unprocessable_entity) if @workfile.workspace.archived?
  end

  def check_authorization
    authorize! :can_edit_sub_objects, @workfile.workspace
  end

  # TODO: DRY this out of this controller and the previews controller [#39410527]
  def row_limit
    (Chorus::Application.config.chorus['default_preview_row_limit'] || 500).to_i
  end
end