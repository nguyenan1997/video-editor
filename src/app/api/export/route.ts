import {NextResponse} from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {project} = body;

    if (!project) {
      return NextResponse.json({error: 'No project data provided'}, {status: 400});
    }

    // For now, return the project data that the client can use
    // with @remotion/renderer for server-side rendering.
    // Full implementation would use:
    //   const {renderMedia} = require('@remotion/renderer');
    //   const composition = /* register and render */;
    //   const output = await renderMedia({...});

    return NextResponse.json({
      message: 'Export job created',
      projectName: project.name,
      duration: project.duration,
      fps: project.fps,
      resolution: `${project.width}x${project.height}`,
      tracks: project.tracks.length,
      clips: project.tracks.reduce((acc: number, t: {clips: unknown[]}) => acc + t.clips.length, 0),
      // In production: return {jobId, downloadUrl}
    });
  } catch (error) {
    return NextResponse.json(
      {error: 'Export failed', details: String(error)},
      {status: 500}
    );
  }
}
