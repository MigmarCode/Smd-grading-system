import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Test basic environment variables
    const envTest = {
      supabaseUrl: supabaseUrl ? 'Present' : 'Missing',
      supabaseAnonKey: supabaseAnonKey ? 'Present' : 'Missing',
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseAnonKey?.length || 0,
    };

    // Test database connection
    let dbTest: { status: string; error?: any } = { status: 'Not tested' };
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('count')
        .limit(1);
      
      if (error) {
        dbTest = { status: 'Error', error: error.message };
      } else {
        dbTest = { status: 'Connected successfully' };
      }
    } catch (dbError) {
      dbTest = { status: 'Connection failed', error: dbError };
    }

    // Test table structure
    let tableTest: { status: string; tables?: Record<string, any>; error?: any } = { status: 'Not tested' };
    try {
      const tables = ['classes', 'subjects', 'teachers', 'students', 'grades', 'class_subjects'];
      const tableResults: Record<string, any> = {};
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (error) {
            tableResults[table] = { status: 'Error', error: error.message };
          } else {
            tableResults[table] = { status: 'OK', count: data?.length || 0 };
          }
        } catch (tableError) {
          tableResults[table] = { status: 'Failed', error: tableError };
        }
      }
      
      tableTest = { status: 'Completed', tables: tableResults };
    } catch (structureError) {
      tableTest = { status: 'Structure test failed', error: structureError };
    }
    
    res.status(200).json({
      message: 'Comprehensive environment and database test',
      timestamp: new Date().toISOString(),
      environment: envTest,
      database: dbTest,
      tables: tableTest
    });
  } catch (error) {
    console.error('Test API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 