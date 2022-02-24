<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        $schema->table('users', function (Blueprint $table) use ($schema) {
            $table->decimal('location_latitude', $precision = 9, $scale = 6)->nullable();
            $table->decimal('location_longitude', $precision = 9, $scale = 6)->nullable();
            $table->text('location_countrycode')->nullable();
            $table->text('location_country')->nullable();
            $table->text('location_postcode')->nullable();
            $table->text('location_city')->nullable();
            $table->dropColumn('location');
        });
    },
    
    'down' => function (Builder $schema) {
        $schema->table('users', function (Blueprint $table) {
            $table->text('location');
            $table->dropColumn('location_city');
            $table->dropColumn('location_postcode');
            $table->dropColumn('location_country');
            $table->dropColumn('location_countrycode');
            $table->dropColumn('location_longitude');
            $table->dropColumn('location_latitude');
        });
    },
];
