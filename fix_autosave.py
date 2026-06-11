import re

with open('/home/nopparus2/www/app9/src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add autoSaveTask function
autosave_func = """
  const autoSaveTask = async (taskToSave: any, newData: any) => {
    if (!taskToSave) return;
    try {
      const completed = isTaskCompleted({ ...taskToSave, survey_data: newData });
      await axios.put(`${API_BASE}/tasks/${taskToSave.task_id}`, {
        survey_data: newData,
        status: completed ? 'Completed' : 'Pending'
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
      console.error('Auto-save failed', e);
    }
  };

"""
content = content.replace("  const handleSaveSurvey = async () => {", autosave_func + "  const handleSaveSurvey = async () => {")

# 2. Hide Save All Records button
content = content.replace("{isSurveyActive ? 'Save All Records' : 'Save Disabled'}", "{isSurveyActive ? 'Saved Automatically' : 'Save Disabled'}")
content = content.replace("className={`px-6 py-2 rounded-lg font-semibold shadow-lg transition-colors ${\\n                  isSurveyActive ? 'bg-teal-500 hover:bg-teal-400 text-slate-950' : 'bg-slate-700 text-slate-500 cursor-not-allowed'\\n                }`}", "className={`px-6 py-2 rounded-lg font-semibold shadow-lg transition-colors ${\\n                  isSurveyActive ? 'bg-slate-800 text-teal-400 border border-slate-700 opacity-70 cursor-default' : 'bg-slate-700 text-slate-500 cursor-not-allowed'\\n                }`}\\n                disabled={true}")

# Also hide Save Survey button in Form view
content = content.replace("{isSurveyActive ? 'Save Survey' : 'Save Disabled'}", "{isSurveyActive ? 'Saved Automatically' : 'Save Disabled'}")
content = content.replace("className={`px-6 py-2 rounded-lg font-medium transition-colors ${\\n                          isSurveyActive ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'\\n                        }`}", "className={`px-6 py-2 rounded-lg font-medium transition-colors ${\\n                          isSurveyActive ? 'bg-slate-800 text-teal-400 border border-slate-700 opacity-70 cursor-default' : 'bg-slate-700 text-slate-500 cursor-not-allowed'\\n                        }`}\\n                        disabled={true}")


# 3. Form View Replacements
# select
content = content.replace("onChange={e => setFormData({...formData, [field.name]: e.target.value})} ", "onChange={e => { const newData = {...formData, [field.name]: e.target.value}; setFormData(newData); autoSaveTask(selectedTask, newData); }} ")
# checkbox
content = content.replace("onChange={e => setFormData({...formData, [field.name]: e.target.checked ? 'true' : 'false'})} ", "onChange={e => { const newData = {...formData, [field.name]: e.target.checked ? 'true' : 'false'}; setFormData(newData); autoSaveTask(selectedTask, newData); }} ")
# image delete
content = content.replace("""                                    setFormData(newFormData);
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title="Remove Image"
                                >""", """                                    setFormData(newFormData);
                                    autoSaveTask(selectedTask, newFormData);
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title="Remove Image"
                                >""")
# image upload
content = content.replace("""                                      setFormData({ ...formData, [field.name]: compressed });
                                    } catch (err) {""", """                                      const newData = { ...formData, [field.name]: compressed };
                                      setFormData(newData);
                                      autoSaveTask(selectedTask, newData);
                                    } catch (err) {""")
# file delete
content = content.replace("""                                      setFormData(newFormData);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-1"
                                    title="Remove File"
                                  >""", """                                      setFormData(newFormData);
                                      autoSaveTask(selectedTask, newFormData);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-1"
                                    title="Remove File"
                                  >""")
# file upload
content = content.replace("""                                      setFormData({ ...formData, [field.name]: dataObj });
                                    } catch (err) {""", """                                      const newData = { ...formData, [field.name]: dataObj };
                                      setFormData(newData);
                                      autoSaveTask(selectedTask, newData);
                                    } catch (err) {""")
# text input
content = content.replace("""                              onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                            />""", """                              onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                              onBlur={() => autoSaveTask(selectedTask, formData)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
                            />""")


# 4. Table View Replacements
# select
content = content.replace("""                                  const newTasks = [...tasks];
                                  const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                  newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: e.target.value };
                                  setTasks(newTasks);
                                }} """, """                                  const newTasks = [...tasks];
                                  const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                  const newData = { ...newTasks[taskIdx].survey_data, [f.name]: e.target.value };
                                  newTasks[taskIdx].survey_data = newData;
                                  setTasks(newTasks);
                                  autoSaveTask(newTasks[taskIdx], newData);
                                }} """)
# checkbox
content = content.replace("""                                    const newTasks = [...tasks];
                                    const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                    newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: e.target.checked ? 'true' : 'false' };
                                    setTasks(newTasks);
                                  }} """, """                                    const newTasks = [...tasks];
                                    const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                    const newData = { ...newTasks[taskIdx].survey_data, [f.name]: e.target.checked ? 'true' : 'false' };
                                    newTasks[taskIdx].survey_data = newData;
                                    setTasks(newTasks);
                                    autoSaveTask(newTasks[taskIdx], newData);
                                  }} """)

# image delete
content = content.replace("""                                      const newTasks = [...tasks];
                                      const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                      const updatedData = { ...newTasks[taskIdx].survey_data };
                                      delete updatedData[f.name];
                                      newTasks[taskIdx].survey_data = updatedData;
                                      setTasks(newTasks);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-0.5"
                                    title="Remove Image"
                                  >""", """                                      const newTasks = [...tasks];
                                      const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                      const updatedData = { ...newTasks[taskIdx].survey_data };
                                      delete updatedData[f.name];
                                      newTasks[taskIdx].survey_data = updatedData;
                                      setTasks(newTasks);
                                      autoSaveTask(newTasks[taskIdx], updatedData);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-0.5"
                                    title="Remove Image"
                                  >""")

# image upload
content = content.replace("""                                        const newTasks = [...tasks];
                                        const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                        newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: compressed };
                                        setTasks(newTasks);
                                      } catch (err) {""", """                                        const newTasks = [...tasks];
                                        const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                        const newData = { ...newTasks[taskIdx].survey_data, [f.name]: compressed };
                                        newTasks[taskIdx].survey_data = newData;
                                        setTasks(newTasks);
                                        autoSaveTask(newTasks[taskIdx], newData);
                                      } catch (err) {""")

# file delete
content = content.replace("""                                      const newTasks = [...tasks];
                                      const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                      const updatedData = { ...newTasks[taskIdx].survey_data };
                                      delete updatedData[f.name];
                                      newTasks[taskIdx].survey_data = updatedData;
                                      setTasks(newTasks);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-0.5"
                                    title="Remove File"
                                  >""", """                                      const newTasks = [...tasks];
                                      const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                      const updatedData = { ...newTasks[taskIdx].survey_data };
                                      delete updatedData[f.name];
                                      newTasks[taskIdx].survey_data = updatedData;
                                      setTasks(newTasks);
                                      autoSaveTask(newTasks[taskIdx], updatedData);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-0.5"
                                    title="Remove File"
                                  >""")

# file upload
content = content.replace("""                                        const newTasks = [...tasks];
                                        const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                        newTasks[taskIdx].survey_data = { ...newTasks[taskIdx].survey_data, [f.name]: dataObj };
                                        setTasks(newTasks);
                                      } catch (err) {""", """                                        const newTasks = [...tasks];
                                        const taskIdx = newTasks.findIndex(x => x.task_id === t.task_id);
                                        const newData = { ...newTasks[taskIdx].survey_data, [f.name]: dataObj };
                                        newTasks[taskIdx].survey_data = newData;
                                        setTasks(newTasks);
                                        autoSaveTask(newTasks[taskIdx], newData);
                                      } catch (err) {""")


with open('/home/nopparus2/www/app9/src/App.tsx', 'w') as f:
    f.write(content)

