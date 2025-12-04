import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Carousel } from '../components/Carousel';
import { fetchTasks } from '../api/tasks';
import { uploadFile } from '../api/uploads';
import { CarouselItem } from '../types/dashboard';

export const DashboardPage = () => {
  const { data: tasksData, error, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks({ limit: 100 }), // Get more tasks for dashboard stats
  });
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Extract tasks array from response
  const tasks = tasksData?.tasks || [];

  const carouselItems = useMemo<CarouselItem[]>(() => {
    if (!tasks.length) {
      return [
        {
          id: 'placeholder',
          title: 'Welcome to TaskFlow',
          description: 'Create tasks and assign them to teammates.',
          backside: 'Tip: Register as an admin to unlock full CRUD access.',
        },
      ];
    }

    return tasks.slice(0, 5).map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || 'No description provided',
      backside: `Owner: ${task.owner?.firstName || 'Unknown'} ${task.owner?.lastName || ''}\nStatus: ${task.status}`,
    }));
  }, [tasks]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus('Uploading…');
      await uploadFile(file);
      setUploadStatus('Upload successful');
    } catch (error) {
      setUploadStatus(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-section">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-section">
          <p className="form-error">
            Failed to load tasks: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-section">
        <h2>Project Highlights</h2>
        <Carousel items={carouselItems} />
      </section>
      <section className="dashboard-section">
        <h2>Quick Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Tasks</span>
            <strong>{tasks.length}</strong>
          </div>
          <div className="stat-card">
            <span>In Progress</span>
            <strong>{tasks.filter((task) => task.status === 'in_progress').length}</strong>
          </div>
          <div className="stat-card">
            <span>Completed</span>
            <strong>{tasks.filter((task) => task.status === 'done').length}</strong>
          </div>
        </div>
      </section>
      <section className="dashboard-section">
        <h2>Upload Reference Files</h2>
        <input type="file" onChange={handleFileUpload} />
        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      </section>
    </div>
  );
};

