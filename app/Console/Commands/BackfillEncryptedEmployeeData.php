<?php

namespace App\Console\Commands;

use App\Models\Employee;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class BackfillEncryptedEmployeeData extends Command
{
    protected $signature = 'employees:backfill-encryption';
    protected $description = 'Encrypt existing plaintext employee data for columns that now use encrypted casts';

    private $encryptedColumns = [
        'hourly_rate',
        'basic_salary',
        'tin_number',
        'sss_number',
        'philhealth_number',
        'pagibig_number',
    ];

    public function handle()
    {
        $this->info('Starting encryption backfill for employee data...');

        $updated = 0;

        DB::transaction(function () use (&$updated) {
            // Use raw DB query to avoid the encrypted cast interfering with reads
            DB::table('employees')->orderBy('id')->chunk(100, function ($employees) use (&$updated) {
                foreach ($employees as $employee) {
                    $updates = [];

                    foreach ($this->encryptedColumns as $column) {
                        $value = $employee->$column;

                        // Skip null/empty values
                        if (is_null($value) || $value === '') {
                            continue;
                        }

                        // Check if the value is already encrypted by trying to decrypt it
                        try {
                            Crypt::decryptString($value);
                            // If decryption succeeds, it's already encrypted — skip
                            continue;
                        } catch (\Exception $e) {
                            // Decryption failed, so the value is still plaintext — encrypt it
                            $updates[$column] = Crypt::encryptString((string) $value);
                        }
                    }

                    if (!empty($updates)) {
                        DB::table('employees')
                            ->where('id', $employee->id)
                            ->update($updates);
                        $updated++;
                    }
                }
            });
        });

        $this->info("Done! Encrypted data for {$updated} employee(s).");
        return Command::SUCCESS;
    }
}
