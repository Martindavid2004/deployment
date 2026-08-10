require 'open3'
require 'tempfile'
require 'timeout'

class SimpleExecutor
  TEMP_DIR = '/tmp/codoai'
  TIME_LIMIT = 10 # seconds
  
  def self.execute(language_id, source_code, input = "")
    language = Language.find(language_id)
    
    # Create temp directory
    Dir.mkdir(TEMP_DIR) unless Dir.exist?(TEMP_DIR)
    
    # Create unique directory for this execution
    execution_dir = File.join(TEMP_DIR, "exec_#{Process.pid}_#{Time.now.to_i}")
    Dir.mkdir(execution_dir)
    
    begin
      # Write source code to file
      source_file = File.join(execution_dir, language.source_file)
      File.write(source_file, source_code)
      
      # Write input to file if provided
      input_file = File.join(execution_dir, 'input.txt')
      File.write(input_file, input) if input
      
      result = {
        stdout: "",
        stderr: "",
        exit_code: 0,
        time: 0,
        memory: 0,
        status: "Accepted"
      }
      
      start_time = Time.now
      
      # Change to execution directory
      Dir.chdir(execution_dir) do
        # Compile if needed
        if language.compile_cmd
          compile_cmd = language.compile_cmd.gsub('%s', '')
          stdout, stderr, status = Open3.capture3(compile_cmd)
          
          unless status.success?
            result[:stderr] = stderr
            result[:status] = "Compilation Error"
            result[:exit_code] = status.exitstatus
            return result
          end
        end
        
        # Execute
        run_cmd = language.run_cmd
        run_cmd += " < #{input_file}" if input && !input.empty?
        
        begin
          Timeout::timeout(TIME_LIMIT) do
            stdout, stderr, status = Open3.capture3(run_cmd)
            result[:stdout] = stdout
            result[:stderr] = stderr
            result[:exit_code] = status.exitstatus
            result[:status] = status.success? ? "Accepted" : "Runtime Error"
          end
        rescue Timeout::Error
          result[:status] = "Time Limit Exceeded"
          result[:stderr] = "Execution timed out after #{TIME_LIMIT} seconds"
        end
      end
      
      result[:time] = ((Time.now - start_time) * 1000).round(3) # milliseconds
      result[:memory] = 1024 # placeholder
      
      result
    rescue => e
      {
        stdout: "",
        stderr: "System Error: #{e.message}",
        exit_code: 1,
        time: 0,
        memory: 0,
        status: "System Error"
      }
    ensure
      # Cleanup
      FileUtils.rm_rf(execution_dir) if Dir.exist?(execution_dir)
    end
  end
end